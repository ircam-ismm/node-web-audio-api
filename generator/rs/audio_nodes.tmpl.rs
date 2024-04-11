use napi::*;
use napi_derive::js_function;
use web_audio_api::node::*;
use crate::*;

pub(crate) struct ${d.napiName(d.node)}(${d.name(d.node)});

// for debug purpose
// impl Drop for ${d.napiName(d.node)} {
//     fn drop(&mut self) {
//         println!("NAPI: ${d.napiName(d.node)} dropped");
//     }
// }

impl ${d.napiName(d.node)} {
    pub fn create_js_class(env: &Env) -> Result<JsFunction> {
        ${(function() {
            let attributes = d.attributes(d.node)
                .filter(attr => attr.name !== 'mediaStream')
                .map(attr => `
                    Property::new("${attr.name}")?
                        .with_getter(get_${d.slug(attr)})${attr.readonly === false ? `
                        .with_setter(set_${d.slug(attr)})` : ``}
                `);

            let methods = d.methods(d.node)
                .map(method => `
                    Property::new("${method.name}")?.with_method(${d.slug(method)})
                `);

            if (d.parent(d.node) === 'AudioScheduledSourceNode') {
                // AudioScheduledSourceNode interface
                methods.push(`Property::new("start")?.with_method(start)`);
                methods.push(`Property::new("stop")?.with_method(stop)`);
                methods.push(`Property::new("__initEventTarget__")?.with_method(init_event_target)`);
            }

            let interface = attributes.concat(methods);

            return `
        let interface = audio_node_interface![${interface.join(',')}];
            `;
        }())}

        env.define_class("${d.name(d.node)}", constructor, &interface)
    }

    // @note: this is also used in audio_node.tmpl.rs for the connect / disconnect macros
    pub fn unwrap(&mut self) -> &mut ${d.name(d.node)} {
        &mut self.0
    }
}

#[js_function(${d.constructor(d.node).arguments.length})]
fn constructor(ctx: CallContext) -> Result<JsUndefined> {
    let mut js_this = ctx.this_unchecked::<JsObject>();

    let js_audio_context = ctx.get::<JsObject>(0)?;

    ${(function() {
        const optionsArg = d.constructor(d.node).arguments[1];
        const optionsType = d.memberType(optionsArg);
        const optionsIdl = d.findInTree(optionsType);
        let hasRequiredMember = false;
        let parseOptions = ``;

        parseOptions += `
    // --------------------------------------------------------
    // Parse ${optionsType}
    // by bindings construction all fields are populated on the JS side
    // --------------------------------------------------------
    let js_options = ctx.get::<JsObject>(1)?;

            ${optionsIdl.members.map(member => {
                const optionName = d.name(member);
                const type = d.memberType(member);
                const required = member.required;
                const defaultValue = member.default; // null or object
                const nullable = member.idlType.nullable; // only AudioBuffer is actually nullable
                const simple_slug = d.slug(member);
                const slug = d.slug(member, true); // append _ to protect from protected keywords

                // Note that the options object has required member for AudioNodeOptions parsing
                hasRequiredMember = hasRequiredMember || required;

                switch (type) {
                    case "boolean": {
                        return `
    let ${slug} = js_options.get::<&str, JsBoolean>("${optionName}")?.unwrap().try_into()?;
                        `;
                        break;
                    }
                    case "float": {
                        return `
    let ${slug} = js_options.get::<&str, JsNumber>("${optionName}")?.unwrap().get_double()? as f32;
                        `;
                        break;
                    }
                    case "double": {
                        return `
    let ${slug} = js_options.get::<&str, JsNumber>("${optionName}")?.unwrap().get_double()?;
                        `;
                        break;
                    }
                    case "unsigned long": {
                        return `
    let ${slug} = js_options.get::<&str, JsNumber>("${optionName}")?.unwrap().get_double()? as usize;
                        `;
                        break;
                    }
                    case "BiquadFilterType":
                    case "OscillatorType":
                    case "PanningModelType":
                    case "DistanceModelType":
                    case "OverSampleType": {
                        const idl = d.findInTree(d.memberType(member));
                        return `
    let ${simple_slug}_js = js_options.get::<&str, JsString>("${optionName}")?.unwrap();
    let ${simple_slug}_str = ${simple_slug}_js.into_utf8()?.into_owned()?;
    let ${slug} = match ${simple_slug}_str.as_str() {${idl.values.map(v => `
        "${v.value}" => ${idl.name}::${d.camelcase(v.value)},`).join("")}
        _ => unreachable!(),
    };
                        `;
                        break;
                    }
                    // default values are null
                    case "PeriodicWave":
                    case "AudioBuffer": {
                        const idl = d.findInTree(d.memberType(member));
                        return `
    let ${simple_slug}_js = js_options.get::<&str, JsUnknown>("${optionName}")?.unwrap();
    let ${slug} = match ${simple_slug}_js.get_type()? {
        ValueType::Object => {
            let ${simple_slug}_js = ${simple_slug}_js.coerce_to_object()?;
            let ${simple_slug}_napi = ctx.env.unwrap::<${d.napiName(idl)}>(&${simple_slug}_js)?;
            Some(${simple_slug}_napi.unwrap().clone())
        },
        ValueType::Null => None,
        _ => unreachable!(),
    };
                        `;
                        break;
                    }
                    case "MediaStream": {
                        const napiName = `Napi${member.idlType.idlType}`;
                        return `
    let ${simple_slug}_js = js_options.get::<&str, JsObject>("${optionName}")?.unwrap();
    let ${simple_slug}_napi = ctx.env.unwrap::<${napiName}>(&${simple_slug}_js)?;
    let ${slug} = ${simple_slug}_napi.unwrap();
                        `;
                        break;
                    }
                    default: {
                        // sequences:
                        let targetType = member.idlType.idlType[0].idlType === "float" ? "f32" : "f64";
                        // - IIRFIlterOptions::feedforward
                        // - IIRFIlterOptions::feedback
                        if (member.required) {
                            return `
    let ${simple_slug}_js = js_options.get::<&str, JsTypedArray>("${optionName}")?.unwrap();
    let ${simple_slug}_value = ${simple_slug}_js.into_value()?;
    let ${slug}: &[${targetType}] = ${simple_slug}_value.as_ref();
    let ${slug} = ${slug}.to_vec();
                            `;
                        // - WevashaperOptions::curve
                        } else {
                            return `
    let ${simple_slug}_js = js_options.get::<&str, JsUnknown>("${optionName}")?.unwrap();
    let ${slug} = if ${simple_slug}_js.get_type()? == ValueType::Null {
        None
    } else {
        let ${simple_slug}_js = js_options.get::<&str, JsTypedArray>("${optionName}")?.unwrap();
        let ${simple_slug}_value = ${simple_slug}_js.into_value()?;
        let ${slug}: &[${targetType}] = ${simple_slug}_value.as_ref();
        Some(${slug}.to_vec())
    };
                            `;
                        }
                        break;
                    }
                }
            // end options member
            }).join("")}
        `;

        if (d.parent(optionsIdl) === "AudioNodeOptions") {
            parseOptions += `
    // --------------------------------------------------------
    // Parse AudioNodeOptions
    // --------------------------------------------------------\
            `;
            // if the node options object has required member, e.g. IIRFilterNodeOptions
            // it does not implement Default, then we need to grab the default
            // directly from AudioNodeOptions
            if (hasRequiredMember) {
                parseOptions += `
    let audio_node_options_default = AudioNodeOptions::default();
                `;
            } else {
                parseOptions += `
    let node_defaults = ${optionsType}::default();
    let audio_node_options_default = node_defaults.audio_node_options;
                `;
            }

            parseOptions += `
    let some_channel_count_js = js_options.get::<&str, JsObject>("channelCount")?;
    let channel_count = if let Some(channel_count_js) = some_channel_count_js {
        channel_count_js.coerce_to_number()?.get_double()? as usize
    } else {
        audio_node_options_default.channel_count
    };

    let some_channel_count_mode_js = js_options.get::<&str, JsObject>("channelCountMode")?;
    let channel_count_mode = if let Some(channel_count_mode_js) = some_channel_count_mode_js {
        let channel_count_mode_str = channel_count_mode_js.coerce_to_string()?.into_utf8()?.into_owned()?;

        match channel_count_mode_str.as_str() {
            "max" => ChannelCountMode::Max,
            "clamped-max" => ChannelCountMode::ClampedMax,
            "explicit" => ChannelCountMode::Explicit,
            _ => panic!("TypeError - Failed to read the 'channelCountMode' property from 'AudioNodeOptions': The provided value '{:?}' is not a valid enum value of type ChannelCountMode", channel_count_mode_str.as_str()),
        }
    } else {
        audio_node_options_default.channel_count_mode
    };

    let some_channel_interpretation_js = js_options.get::<&str, JsObject>("channelInterpretation")?;
    let channel_interpretation = if let Some(channel_interpretation_js) = some_channel_interpretation_js {
        let channel_interpretation_str = channel_interpretation_js.coerce_to_string()?.into_utf8()?.into_owned()?;

        match channel_interpretation_str.as_str() {
            "speakers" => ChannelInterpretation::Speakers,
            "discrete" => ChannelInterpretation::Discrete,
            _ => panic!("TypeError - Failed to read the 'channelInterpretation' property from 'AudioNodeOptions': The provided value '{:?}' is not a valid enum value of type ChannelInterpretation", channel_interpretation_str.as_str()),
        }
    } else {
        audio_node_options_default.channel_interpretation
    };

    // --------------------------------------------------------
    // Create ${d.name(optionsIdl)} object
    // --------------------------------------------------------
    let options = ${optionsType} {
        ${optionsIdl.members.map(m => d.slug(m, true)).join(",")},
        audio_node_options: AudioNodeOptions {
            channel_count,
            channel_count_mode,
            channel_interpretation,
        },
    };
            `;
        } else {
            parseOptions += `
    // --------------------------------------------------------
    // Create ${d.name(optionsIdl)} object
    // --------------------------------------------------------
    let options = ${optionsType} {
        ${optionsIdl.members.map(m => d.slug(m, true)).join(",")},
    };
            `;
        }

        return parseOptions;
    }())}

    // --------------------------------------------------------
    // Create native ${d.name(d.node)}
    // --------------------------------------------------------
    let audio_context_name = js_audio_context.get_named_property::<JsString>("Symbol.toStringTag")?;
    let audio_context_utf8_name = audio_context_name.into_utf8()?.into_owned()?;
    let audio_context_str = &audio_context_utf8_name[..];

    let native_node = match audio_context_str {
        "AudioContext" => {
            let napi_audio_context = ctx.env.unwrap::<NapiAudioContext>(&js_audio_context)?;
            let audio_context = napi_audio_context.unwrap();
            ${d.name(d.node)}::new(audio_context, options)
        }
        "OfflineAudioContext" => {
            let napi_audio_context = ctx.env.unwrap::<NapiOfflineAudioContext>(&js_audio_context)?;
            let audio_context = napi_audio_context.unwrap();
            ${d.name(d.node)}::new(audio_context, options)
        }
        &_ => unreachable!(),
    };

    ${d.audioParams(d.node).length > 0 ? `
    // --------------------------------------------------------
    // Bind AudioParam to JS object
    // --------------------------------------------------------
    let store_ref: &mut napi::Ref<()> = ctx.env.get_instance_data()?.unwrap();
    let store: JsObject = ctx.env.get_reference_value(store_ref)?;
    let ctor: JsFunction = store.get_named_property("AudioParam")?;
    ` : ``}
    ${d.audioParams(d.node).map((param) => {
        return `
    let native_param = native_node.${d.slug(param.name)}().clone();
    let js_obj = ctor.new_instance(&[&js_this])?;
    let napi_obj = ctx.env.unwrap::<NapiAudioParam>(&js_obj)?;
    napi_obj.wrap(native_param);
    // ctx.env.wrap(&mut js_obj, napi_param)?;
    js_this.set_named_property("${param.name}", &js_obj)?;
        `;
    }).join('')}

    // --------------------------------------------------------
    // Finalize instance creation
    // --------------------------------------------------------
    js_this.define_properties(&[
        Property::new("context")?
            .with_value(&js_audio_context)
            .with_property_attributes(PropertyAttributes::Enumerable),
        // this must be put on the instance and not in the prototype to be reachable
        Property::new("Symbol.toStringTag")?
            .with_value(&ctx.env.create_string("${d.name(d.node)}")?)
            .with_property_attributes(PropertyAttributes::Static),
    ])?;

    // finalize instance creation
    let napi_node = ${d.napiName(d.node)}(native_node);
    ctx.env.wrap(&mut js_this, napi_node)?;

    ctx.env.get_undefined()
}

audio_node_impl!(${d.napiName(d.node)});

${(function() {
    if (d.parent(d.node) === "AudioScheduledSourceNode") {
        let methods = `
// -------------------------------------------------
// AudioScheduledSourceNode Interface
// -------------------------------------------------\
        `;

        if (d.name(d.node) !== "AudioBufferSourceNode") {
            methods += `
#[js_function(1)]
fn start(ctx: CallContext) -> Result<JsUndefined> {
    let js_this = ctx.this_unchecked::<JsObject>();
    let napi_node = ctx.env.unwrap::<${d.napiName(d.node)}>(&js_this)?;
    let node = napi_node.unwrap();

    let when = ctx.get::<JsNumber>(0)?.get_double()?;
    node.start_at(when);

    ctx.env.get_undefined()
}
            `;
        } else {
            methods +=  `
#[js_function(3)]
fn start(ctx: CallContext) -> Result<JsUndefined> {
    let js_this = ctx.this_unchecked::<JsObject>();
    let napi_node = ctx.env.unwrap::<${d.napiName(d.node)}>(&js_this)?;
    let node = napi_node.unwrap();

    let when = ctx.get::<JsNumber>(0)?.get_double()?;

    let offset_js = ctx.get::<JsUnknown>(1)?;
    let offset = match offset_js.get_type()? {
        ValueType::Number => offset_js.coerce_to_number()?.get_double()?,
        ValueType::Null => 0.,
        _ => unreachable!(),
    };

    let duration_js = ctx.get::<JsUnknown>(2)?;
    let duration = match duration_js.get_type()? {
        ValueType::Number => duration_js.coerce_to_number()?.get_double()?,
        ValueType::Null => f64::MAX,
        _ => unreachable!(),
    };

    node.start_at_with_offset_and_duration(when, offset, duration);

    ctx.env.get_undefined()
}
            `;
        }

        methods += `
#[js_function(1)]
fn stop(ctx: CallContext) -> Result<JsUndefined> {
    let js_this = ctx.this_unchecked::<JsObject>();
    let napi_node = ctx.env.unwrap::<${d.napiName(d.node)}>(&js_this)?;
    let node = napi_node.unwrap();

    let when = ctx.get::<JsNumber>(0)?.get_double()?;
    node.stop_at(when);

    ctx.env.get_undefined()
}
        `;

        methods += `
// ----------------------------------------------------
// EventTarget initialization - cf. js/utils/events.js
// ----------------------------------------------------
#[js_function]
fn init_event_target(ctx: CallContext) -> Result<JsUndefined> {
    use napi::threadsafe_function::{ThreadSafeCallContext, ThreadsafeFunctionCallMode};
    use web_audio_api::Event;

    let js_this = ctx.this_unchecked::<JsObject>();
    let napi_node = ctx.env.unwrap::<${d.napiName(d.node)}>(&js_this)?;
    let node = napi_node.unwrap();

    // garb the napi audio context
    let js_audio_context: JsObject = js_this.get_named_property("context")?;
    let audio_context_name =
        js_audio_context.get_named_property::<JsString>("Symbol.toStringTag")?;
    let audio_context_utf8_name = audio_context_name.into_utf8()?.into_owned()?;
    let audio_context_str = &audio_context_utf8_name[..];

    let dispatch_event_symbol = ctx.env.symbol_for("node-web-audio-api:napi-dispatch-event").unwrap();
    let js_func = js_this.get_property(dispatch_event_symbol).unwrap();

    let tsfn = ctx.env.create_threadsafe_function(&js_func, 0, |ctx: ThreadSafeCallContext<Event>| {
        let event_type = ctx.env.create_string(ctx.value.type_)?;
        Ok(vec![event_type])
    })?;

    match audio_context_str {
        "AudioContext" => {
            let napi_context = ctx.env.unwrap::<NapiAudioContext>(&js_audio_context)?;
            let store_id = napi_context.store_thread_safe_listener(tsfn.clone());
            let napi_context = napi_context.clone();

            node.set_onended(move |e| {
                tsfn.call(Ok(e), ThreadsafeFunctionCallMode::Blocking);
                napi_context.clear_thread_safe_listener(store_id);
            });
        }
        "OfflineAudioContext" => {
            let napi_context = ctx.env.unwrap::<NapiOfflineAudioContext>(&js_audio_context)?;
            let store_id = napi_context.store_thread_safe_listener(tsfn.clone());
            let napi_context = napi_context.clone();

            node.set_onended(move |e| {
                tsfn.call(Ok(e), ThreadsafeFunctionCallMode::Blocking);
                napi_context.clear_thread_safe_listener(store_id);
            });
        }
        &_ => unreachable!(),
    };

    ctx.env.get_undefined()
}
        `;

        return methods;
    } else {
        return ``;
    }
}())}

${d.attributes(d.node).length > 0 ? `
// -------------------------------------------------
// Getters / Setters
// -------------------------------------------------\
` : ``}
${d.attributes(d.node).map(attr => {
    const attrType = d.memberType(attr);
    let getter = ``;
    let setter = ``;

    // -------------------------------------------------
    // Getters
    // -------------------------------------------------
    switch (attrType) {
        case "boolean": {
            getter = `
#[js_function(0)]
fn get_${d.slug(attr)}(ctx: CallContext) -> Result<JsBoolean> {
    let js_this = ctx.this_unchecked::<JsObject>();
    let napi_node = ctx.env.unwrap::<${d.napiName(d.node)}>(&js_this)?;
    let node = napi_node.unwrap();

    let value = node.${d.slug(attr, true)}();
    ctx.env.get_boolean(value)
}
            `;
            break;
        }
        case "float": {
            getter = `
#[js_function(0)]
fn get_${d.slug(attr)}(ctx: CallContext) -> Result<JsNumber> {
    let js_this = ctx.this_unchecked::<JsObject>();
    let napi_node = ctx.env.unwrap::<${d.napiName(d.node)}>(&js_this)?;
    let node = napi_node.unwrap();

    let value = node.${d.slug(attr, true)}();
    ctx.env.create_double(value as f64)
}
            `;
            break;
        }
        case "double": {
            getter = `
#[js_function(0)]
fn get_${d.slug(attr)}(ctx: CallContext) -> Result<JsNumber> {
    let js_this = ctx.this_unchecked::<JsObject>();
    let napi_node = ctx.env.unwrap::<${d.napiName(d.node)}>(&js_this)?;
    let node = napi_node.unwrap();

    let value = node.${d.slug(attr, true)}();
    ctx.env.create_double(value)
}
            `;
            break;
        }
        case "unsigned long": {
            getter = `
#[js_function(0)]
fn get_${d.slug(attr)}(ctx: CallContext) -> Result<JsNumber> {
    let js_this = ctx.this_unchecked::<JsObject>();
    let napi_node = ctx.env.unwrap::<${d.napiName(d.node)}>(&js_this)?;
    let node = napi_node.unwrap();

    let value = node.${d.slug(attr, true)}();
    ctx.env.create_double(value as f64)
}
            `;
        }
            break;
        case "BiquadFilterType":
        case "OscillatorType":
        case "PanningModelType":
        case "DistanceModelType":
        case "OverSampleType": {
            let typeIdl = d.findInTree(attrType);

            getter = `
#[js_function(0)]
fn get_${d.slug(attr)}(ctx: CallContext) -> Result<JsString> {
    let js_this = ctx.this_unchecked::<JsObject>();
    let napi_node = ctx.env.unwrap::<${d.napiName(d.node)}>(&js_this)?;
    let node = napi_node.unwrap();

    let value = node.${d.slug(attr, true)}();
    let js_value = match value {${typeIdl.values.map(v => `
        ${typeIdl.name}::${d.camelcase(v.value)} => "${v.value}",`).join("")}
    };

    ctx.env.create_string(js_value)
}
            `;
            break;
        }
        case "Float32Array": {
            // WaveShaperNode::curve
            getter = `
#[js_function(0)]
fn get_${d.slug(attr)}(ctx: CallContext) -> Result<JsUnknown> {
    let js_this = ctx.this_unchecked::<JsObject>();
    let napi_node = ctx.env.unwrap::<${d.napiName(d.node)}>(&js_this)?;
    let node = napi_node.unwrap();

    let value = node.${d.slug(attr, true)}();

    if let Some(arr_f32) = value {
        let length = arr_f32.len();
        let arr_u8 = crate::to_byte_slice(arr_f32);

        Ok(ctx.env
            .create_arraybuffer_with_data(arr_u8.to_vec())
            .map(|array_buffer| {
                array_buffer
                    .into_raw()
                    .into_typedarray(TypedArrayType::Float32, length, 0)
            })
            .unwrap()?
            .into_unknown())
    } else {
        Ok(ctx.env.get_null()?.into_unknown())
    }
}
                    `;
            break;
        }
        case "AudioBuffer": {
            // This should never be called as the AudioBuffer is stored directly
            // on the JS side to retrieve the exact same AudioBuffer reference.
            // - AudioBufferSourceNode::buffer
            // - ConvolverNode::curve
            getter = `
#[js_function(0)]
fn get_${d.slug(attr)}(_ctx: CallContext) -> Result<JsUnknown> {
    unreachable!();
}
            `
            break;
        }
        // IDL types
        default: {
            console.log(`[warning] Unhandled getter ${d.name(d.node)}::${d.name(attr)}: type: ${attrType}`);
            break;
        }
    }

    // -------------------------------------------------
    // Setters
    // -------------------------------------------------
    if (!attr.readonly) {
        switch (attrType) {
            case "boolean": {
                setter = `
#[js_function(1)]
fn set_${d.slug(attr)}(ctx: CallContext) -> Result<JsUndefined> {
    let js_this = ctx.this_unchecked::<JsObject>();
    let napi_node = ctx.env.unwrap::<${d.napiName(d.node)}>(&js_this)?;
    let node = napi_node.unwrap();

    let value = ctx.get::<JsBoolean>(0)?.try_into()?;
    node.set_${d.slug(attr)}(value);

    ctx.env.get_undefined()
}
                `;
                break;
            }
            case "float": {
                setter = `
#[js_function(1)]
fn set_${d.slug(attr)}(ctx: CallContext) -> Result<JsUndefined> {
    let js_this = ctx.this_unchecked::<JsObject>();
    let napi_node = ctx.env.unwrap::<${d.napiName(d.node)}>(&js_this)?;
    let node = napi_node.unwrap();

    let value = ctx.get::<JsNumber>(0)?.get_double()? as f32;
    node.set_${d.slug(attr)}(value);

    ctx.env.get_undefined()
}
                `;
                break;
            }
            case "double": {
                setter = `
#[js_function(1)]
fn set_${d.slug(attr)}(ctx: CallContext) -> Result<JsUndefined> {
    let js_this = ctx.this_unchecked::<JsObject>();
    let napi_node = ctx.env.unwrap::<${d.napiName(d.node)}>(&js_this)?;
    let node = napi_node.unwrap();

    let value = ctx.get::<JsNumber>(0)?.get_double()?;
    node.set_${d.slug(attr)}(value);

    ctx.env.get_undefined()
}
                `;
                break;
            }
            case "unsigned long": {
                setter = `
#[js_function(1)]
fn set_${d.slug(attr)}(ctx: CallContext) -> Result<JsUndefined> {
    let js_this = ctx.this_unchecked::<JsObject>();
    let napi_node = ctx.env.unwrap::<${d.napiName(d.node)}>(&js_this)?;
    let node = napi_node.unwrap();

    let value = ctx.get::<JsNumber>(0)?.get_double()? as usize;
    node.set_${d.slug(attr)}(value);

    ctx.env.get_undefined()
}
                `;
                break;
            }
            case "BiquadFilterType":
            case "OscillatorType":
            case "PanningModelType":
            case "DistanceModelType":
            case "OverSampleType": {
                let typeIdl = d.findInTree(attrType);

                setter = `
#[js_function(1)]
fn set_${d.slug(attr)}(ctx: CallContext) -> Result<JsUndefined> {
    let js_this = ctx.this_unchecked::<JsObject>();
    let napi_node = ctx.env.unwrap::<${d.napiName(d.node)}>(&js_this)?;
    let node = napi_node.unwrap();

    let js_str = ctx.get::<JsObject>(0)?.coerce_to_string()?;
    let utf8_str = js_str.into_utf8()?.into_owned()?;
    let value = match utf8_str.as_str() {${typeIdl.values.map(v => `
        "${v.value}" => ${typeIdl.name}::${d.camelcase(v.value)},`).join("")}
        _ => unreachable!(),
    };

    node.set_${d.slug(attr)}(value);

    ctx.env.get_undefined()
}
                `;
                break;
            }
            case "Float32Array": {
                // WaveShaperNode::curve
                setter = `
#[js_function(1)]
fn set_${d.slug(attr)}(ctx: CallContext) -> Result<JsUndefined> {
    let js_this = ctx.this_unchecked::<JsObject>();
    let napi_node = ctx.env.unwrap::<${d.napiName(d.node)}>(&js_this)?;
    let node = napi_node.unwrap();

    let js_obj = ctx.get::<JsTypedArray>(0)?;
    let buffer = js_obj.into_value()?;
    let buffer_ref: &[f32] = buffer.as_ref();
    node.set_${d.slug(attr)}(buffer_ref.to_vec());

    ctx.env.get_undefined()
}
                `;
                break;
            }
            case "AudioBuffer": {
                let typeIdl = d.findInTree(attrType);

                setter = `
#[js_function(1)]
fn set_${d.slug(attr)}(ctx: CallContext) -> Result<JsUndefined> {
    let js_this = ctx.this_unchecked::<JsObject>();
    let napi_node = ctx.env.unwrap::<${d.napiName(d.node)}>(&js_this)?;
    let node = napi_node.unwrap();

    let js_obj = ctx.get::<JsObject>(0)?;
    let napi_obj = ctx.env.unwrap::<${d.napiName(typeIdl)}>(&js_obj)?;
    let obj = napi_obj.unwrap();
    node.set_${d.slug(attr)}(obj.clone());

    ctx.env.get_undefined()
}
                `;
                break;
            }
            default: {
                console.log(`[warning] Unhandled setter ${d.name(d.node)}::${d.name(attr)}: type: ${attrType}`);
                break;
            }
        }
    }

    return `${getter}${setter}`
}).join('')}


${d.methods(d.node).length > 0 ? `
// -------------------------------------------------
// METHODS
// -------------------------------------------------\
` : ``}
${d.methods(d.node).map(method => {
    return `
#[js_function(${method.arguments.length})]
fn ${d.slug(method)}(ctx: CallContext) -> Result<JsUndefined> {
    let js_this = ctx.this_unchecked::<JsObject>();
    let napi_node = ctx.env.unwrap::<${d.napiName(d.node)}>(&js_this)?;
    let node = napi_node.unwrap();

    ${method.arguments.map((arg, index) => {
        const attrType = d.memberType(arg);

        switch (attrType) {
            case "float": {
                return `
    let ${d.slug(arg.name)} = ctx.get::<JsNumber>(${index})?.get_double()? as f32;
                `;
                break;
            }
            case "Float32Array": {
                return `
    let mut ${d.slug(arg.name)}_js = ctx.get::<JsTypedArray>(${index})?.into_value()?;
    let ${d.slug(arg.name)}: &mut [f32] = ${d.slug(arg.name)}_js.as_mut();
                `;
                break;
            }
            case "Uint8Array": {
                return `
    let mut ${d.slug(arg.name)}_js = ctx.get::<JsTypedArray>(${index})?.into_value()?;
    let ${d.slug(arg.name)}: &mut [u8] = ${d.slug(arg.name)}_js.as_mut();
                `;
                break;
            }
            case "PeriodicWave": {
                let typeIdl = d.findInTree(attrType);

                return `
    let ${d.slug(arg.name)}_js = ctx.get::<JsObject>(${index})?;
    let ${d.slug(arg.name)}_napi = ctx.env.unwrap::<${d.napiName(typeIdl)}>(&${d.slug(arg.name)}_js)?;
    let ${d.slug(arg.name)} = ${d.slug(arg.name)}_napi.unwrap().clone();
                `;
                break;
            }
            default: {
                console.log(`[warning] Unhandled method argument ${d.name(d.node)}::${d.slug(method)}: ${arg.name} with type: ${attrType}`);
                break;
            }
        }
    }).join("")}

    node.${d.slug(method)}(${method.arguments.map(arg => d.slug(arg.name)).join(",")});

    ctx.env.get_undefined()
}
    `;
}).join('')}

