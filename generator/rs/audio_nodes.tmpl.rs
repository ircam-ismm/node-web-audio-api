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
        env.define_class(
            "${d.name(d.node)}",
            constructor,
            &[

                // Attributes
                ${d.attributes(d.node)
                    .filter(attr => attr.name !== 'mediaStream')
                    .map(attr => `
                        Property::new("${attr.name}")?
                            .with_getter(get_${d.slug(attr)})${attr.readonly === false ? `
                            .with_setter(set_${d.slug(attr)})` : ``}
                            .with_property_attributes(PropertyAttributes::Enumerable),
                        `
                    ).join('')}
                // Methods
                ${d.methods(d.node).map(method => `
                    Property::new("${method.name}")?
                        .with_method(${d.slug(method)})
                        .with_property_attributes(PropertyAttributes::Enumerable),
                    `
                ).join('')}
                // AudioNode interface
                Property::new("channelCount")?
                    .with_getter(get_channel_count)
                    .with_setter(set_channel_count),
                Property::new("channelCountMode")?
                    .with_getter(get_channel_count_mode)
                    .with_setter(set_channel_count_mode),
                Property::new("channelInterpretation")?
                    .with_getter(get_channel_interpretation)
                    .with_setter(set_channel_interpretation),
                Property::new("numberOfInputs")?
                    .with_getter(get_number_of_inputs),
                Property::new("numberOfOutputs")?
                    .with_getter(get_number_of_outputs),

                Property::new("connect")?
                    .with_method(connect)
                    .with_property_attributes(PropertyAttributes::Enumerable),
                Property::new("disconnect")?
                    .with_method(disconnect)
                    .with_property_attributes(PropertyAttributes::Enumerable),

                ${d.parent(d.node) === 'AudioScheduledSourceNode' ? `
                // AudioScheduledSourceNode interface
                Property::new("start")?
                    .with_method(start)
                    .with_property_attributes(PropertyAttributes::Enumerable),
                Property::new("stop")?.
                    with_method(stop)
                    .with_property_attributes(PropertyAttributes::Enumerable),
                Property::new("__initEventTarget__")?
                    .with_method(init_event_target),
                ` : ``
                }

            ]
        )
    }

    // @note: this is also used in audio_node.tmpl.rs for the connect / disconnect macros
    pub fn unwrap(&mut self) -> &mut ${d.name(d.node)} {
        &mut self.0
    }
}

#[js_function(${d.constructor(d.node).arguments.length})]
fn constructor(ctx: CallContext) -> Result<JsUndefined> {
    let mut js_this = ctx.this_unchecked::<JsObject>();
    // first argument should be an AudioContext
    let js_audio_context = ctx.get::<JsObject>(0)?;

    let audio_context_name = js_audio_context.get_named_property::<JsString>("Symbol.toStringTag")?;
    let audio_context_utf8_name = audio_context_name.into_utf8()?.into_owned()?;
    // let audio_context_str = &audio_context_utf8_name[..];
    // check that
    // let audio_context_utf8_name = if let Ok(result) = js_audio_context.has_named_property("Symbol.toStringTag") {
    //     if result {
    //         let audio_context_name = js_audio_context.get_named_property::<JsString>("Symbol.toStringTag")?;
    //         let audio_context_utf8_name = audio_context_name.into_utf8()?.into_owned()?;
    //         let audio_context_str = &audio_context_utf8_name[..];

    //         if audio_context_str != "AudioContext" && audio_context_str != "OfflineAudioContext" {
    //             let msg = "TypeError - Failed to construct '${d.name(d.node)}': argument 1 is not of type BaseAudioContext";
    //             return Err(napi::Error::new(napi::Status::InvalidArg, msg));
    //         }

    //         audio_context_utf8_name
    //     } else {
    //         let msg = "TypeError - Failed to construct '${d.name(d.node)}': argument 1 is not of type BaseAudioContext";
    //         return Err(napi::Error::new(napi::Status::InvalidArg, msg));
    //     }
    // } else {
    //     // This swallowed somehow, .e.g const node = new GainNode(null); throws
    //     // TypeError Cannot convert undefined or null to object
    //     // To be investigated...
    //     let msg = "TypeError - Failed to construct '${d.name(d.node)}': argument 1 is not of type BaseAudioContext";
    //     return Err(napi::Error::new(napi::Status::InvalidArg, msg));
    // };


    js_this.define_properties(&[
        Property::new("context")?
            .with_value(&js_audio_context)
            .with_property_attributes(PropertyAttributes::Enumerable),
        // this must be put on the instance and not in the prototype to be reachable
        Property::new("Symbol.toStringTag")?
            .with_value(&ctx.env.create_string("${d.name(d.node)}")?)
            .with_property_attributes(PropertyAttributes::Static),
    ])?;

    ${d.constructor(d.node).arguments.map((argument, index) => {
        // ----------------------------------------------
        // parse options
        // ----------------------------------------------
        if (index == 0) { // index 0 is always AudioContext
            return;
        }

        const arg = d.constructor(d.node).arguments[1];
        const argIdlType = d.memberType(arg);
        const argumentIdl = d.findInTree(argIdlType);

        return `
    // parse options
    let options = if let Ok(either_options) = ctx.try_get::<JsObject>(${index}) {
        match either_options {
            Either::A(options_js) => {
                ${argumentIdl.members.map(m => {
                    const simple_slug = d.slug(m);
                    const slug = d.slug(m, true);

                    switch (d.memberType(m)) {

                        case 'boolean':
                            return `
                let some_${simple_slug}_js = options_js.get::<&str, JsObject>("${m.name}")?;
                let ${slug} = if let Some(${simple_slug}_js) = some_${simple_slug}_js {
                    ${simple_slug}_js.coerce_to_bool()?.try_into()?
                } else {
                    ${m.required ? `return Err(napi::Error::from_reason(
                        "Parameter ${d.name(m)} is required".to_string(),
                    ));` : m.default.value}
                };
                            `;

                        case 'unsigned long':
                            return `
                let some_${simple_slug}_js = options_js.get::<&str, JsObject>("${m.name}")?;
                let ${slug} = if let Some(${simple_slug}_js) = some_${simple_slug}_js {
                    ${simple_slug}_js.coerce_to_number()?.get_double()? as usize
                } else {
                    ${m.required ? `return Err(napi::Error::from_reason(
                        "Parameter ${d.name(m)} is required".to_string(),
                    ));` : m.default.value}
                };
                            `;

                        case 'float':
                            return `
                let some_${simple_slug}_js = options_js.get::<&str, JsObject>("${m.name}")?;
                let ${slug} = if let Some(${simple_slug}_js) = some_${simple_slug}_js {
                    ${simple_slug}_js.coerce_to_number()?.get_double()? as f32
                } else {
                    ${m.required ? `return Err(napi::Error::from_reason(
                        "Parameter ${d.name(m)} is required".to_string(),
                    ));` : parseInt(m.default.value) ==  m.default.value ? `${parseInt(m.default.value)}.` : m.default.value}

                };
                            `;

                        case 'double':
                            return `
                let some_${simple_slug}_js = options_js.get::<&str, JsObject>("${m.name}")?;
                let ${slug} = if let Some(${simple_slug}_js) = some_${simple_slug}_js {
                    ${simple_slug}_js.coerce_to_number()?.get_double()?
                } else {
                    ${m.required ? `return Err(napi::Error::from_reason(
                        "Parameter ${d.name(m)} is required".to_string(),
                    ));` : parseInt(m.default.value) ==  m.default.value ? `${parseInt(m.default.value)}.` : m.default.value}
                };
                            `;
                            break;

                        default:
                            // Handle Float32Arrays and Float64Arrays
                            // ---------------------------------------------------
                            if (m.idlType.type === 'dictionary-type' && m.idlType.generic === 'sequence') {
                                return `
                let ${simple_slug} = if let Some(${simple_slug}_js) = options_js.get::<&str, JsTypedArray>("${m.name}")? {
                    let ${simple_slug}_value = ${simple_slug}_js.into_value()?;
                    let ${simple_slug}: &[${m.idlType.idlType[0].idlType === 'double' ? 'f64' : 'f32'}] = ${simple_slug}_value.as_ref();

                    ${m.required ? `${simple_slug}.to_vec()` : `Some(${simple_slug}.to_vec())`}
                } else {
                    ${m.required ? `return Err(napi::Error::from_reason(
                        "Parameter ${d.name(m)} is required".to_string(),
                    ));` : `None`}
                };
                                `;
                            }

                            const idl = d.findInTree(d.memberType(m));

                            // Handle type defined in IDL
                            // note that MediaStream is not defined in IDL
                            // ---------------------------------------------------
                            if (idl !== undefined) {
                                const idlType = d.type(idl);

                                switch (idlType) {
                                    // type, panningModel, distanceModel, oversample
                                    case 'enum':
                                        return `
                    let some_${simple_slug}_js = options_js.get::<&str, JsString>("${m.name}")?;
                    let ${slug} = if let Some(${simple_slug}_js) = some_${simple_slug}_js {
                        let ${simple_slug}_str = ${simple_slug}_js.into_utf8()?.into_owned()?;

                        match ${simple_slug}_str.as_str() {${idl.values.map(v => `
                            "${v.value}" => ${idl.name}::${d.camelcase(v.value)},`).join('')}
                            _ => panic!("undefined value for ${idl.name}"),
                        }
                    } else {
                        ${m.required ? `return Err(napi::Error::from_reason(
                            "Parameter ${d.name(m)} is required".to_string(),
                        ));` : `${idl.name}::default()`}
                    };
                                        `;
                                        break;
                                    // AudioBuffer, PeriodicWave
                                    case 'interface':
                                        return `
                    let some_${simple_slug}_js = options_js.get::<&str, JsUnknown>("${m.name}")?;
                    let ${slug} = if let Some(${simple_slug}_js) = some_${simple_slug}_js {
                        // nullable options
                        match ${simple_slug}_js.get_type()? {
                            ValueType::Object => {
                                let ${simple_slug}_js = ${simple_slug}_js.coerce_to_object()?;
                                let ${simple_slug}_napi = ctx.env.unwrap::<${d.napiName(idl)}>(&${simple_slug}_js)?;
                                Some(${simple_slug}_napi.unwrap().clone())
                            },
                            ValueType::Null => None,
                            _ => unreachable!(),
                        }
                    } else {
                        None
                    };
                                        `;
                                    default:
                                        console.log(`[constructor2] > cannot parse argument ${d.name(idl)} - idlType ${idlType}`);
                                        break;
                                }
                            } else {
                                // MediaStream
                                // - not defined in IDL, just use infos from member
                                const idl = m;
                                const napiName = `Napi${idl.idlType.idlType}`;

                                return `
                    let some_${simple_slug}_js = options_js.get::<&str, JsObject>("${m.name}")?;
                    let ${slug} = if let Some(${simple_slug}_js) = some_${simple_slug}_js {
                        let ${simple_slug}_napi = ctx.env.unwrap::<${napiName}>(&${simple_slug}_js)?;
                        ${simple_slug}_napi.unwrap()
                    } else {
                        return Err(napi::Error::from_reason(
                            "Parameter ${d.name(m)} is required".to_string(),
                        ));
                    };
                                `;
                            }

                            break;
                    }
                }).join('')}

                ${d.parent(argumentIdl) === 'AudioNodeOptions' ? `
                    ${argumentIdl.members.reduce((acc, current) => acc || current.required, false) ? `
                // can't create default from ${argIdlType}
                let channel_config_defaults = ChannelConfigOptions::default();
                    ` : `
                let node_defaults = ${argIdlType}::default();
                let channel_config_defaults = node_defaults.channel_config;
                    `}

                let some_channel_count_js = options_js.get::<&str, JsObject>("channelCount")?;
                let channel_count = if let Some(channel_count_js) = some_channel_count_js {
                    channel_count_js.coerce_to_number()?.get_double()? as usize
                } else {
                    channel_config_defaults.count
                };

                let some_channel_count_mode_js = options_js.get::<&str, JsObject>("channelCountMode")?;
                let channel_count_mode = if let Some(channel_count_mode_js) = some_channel_count_mode_js {
                    let channel_count_mode_str = channel_count_mode_js.coerce_to_string()?.into_utf8()?.into_owned()?;

                    match channel_count_mode_str.as_str() {
                        "max" => ChannelCountMode::Max,
                        "clamped-max" => ChannelCountMode::ClampedMax,
                        "explicit" => ChannelCountMode::Explicit,
                        _ => panic!("TypeError - Failed to read the 'channelCountMode' property from 'AudioNodeOptions': The provided value '{:?}' is not a valid enum value of type ChannelCountMode", channel_count_mode_str.as_str()),
                    }
                } else {
                    channel_config_defaults.count_mode
                };

                let some_channel_interpretation_js = options_js.get::<&str, JsObject>("channelInterpretation")?;
                let channel_interpretation = if let Some(channel_interpretation_js) = some_channel_interpretation_js {
                    let channel_interpretation_str = channel_interpretation_js.coerce_to_string()?.into_utf8()?.into_owned()?;

                    match channel_interpretation_str.as_str() {
                        "speakers" => ChannelInterpretation::Speakers,
                        "discrete" => ChannelInterpretation::Discrete,
                        _ => panic!("TypeError - Failed to read the 'channelInterpretation' property from 'AudioNodeOptions': The provided value '{:?}' is not a valid enum value of type ChannelInterpretation", channel_interpretation_str.as_str()),
                    }
                } else {
                    channel_config_defaults.interpretation
                };
                ` : ``}

                ${argIdlType} {
                    ${argumentIdl.members.map(m => d.slug(m, true)).join(', ')},
                    ${d.parent(argumentIdl) === 'AudioNodeOptions' ?
                    `channel_config: ChannelConfigOptions {
                        count: channel_count,
                        count_mode: channel_count_mode,
                        interpretation: channel_interpretation,
                    },` : ``}
                }
            },
            Either::B(_) => {
                ${argumentIdl.members.reduce((acc, current) => acc || current.required, false) ? `
                    return Err(napi::Error::from_reason(
                        "TypeError - Options are mandatory for node ${d.name(d.node)}".to_string(),
                    ));
                ` : `
                    Default::default()
                `}
            }
        }
    } else {
        ${argumentIdl.members.reduce((acc, current) => acc || current.required, false) ? `
            return Err(napi::Error::from_reason(
                "TypeError - Options are mandatory for node ${d.name(d.node)}".to_string(),
            ));
        ` : `
            Default::default()
        `}
    };

        `; // end options
    }).join('')}

    let audio_context_str = &audio_context_utf8_name[..];
    // create native node
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

    ${d.audioParams(d.node).map((param) => {
        return `
    // AudioParam: ${d.name(d.node)}::${param.name}
    let native_param = native_node.${d.slug(param.name)}().clone();
    let napi_param = NapiAudioParam::new(native_param);
    let mut js_obj = NapiAudioParam::create_js_object(ctx.env)?;
    ctx.env.wrap(&mut js_obj, napi_param)?;
    js_this.set_named_property("${param.name}", &js_obj)?;
        `;
    }).join('')}

    // finalize instance creation
    let napi_node = ${d.napiName(d.node)}(native_node);
    ctx.env.wrap(&mut js_this, napi_node)?;

    ctx.env.get_undefined()
}

// -------------------------------------------------
// AudioNode Interface
// -------------------------------------------------
#[js_function]
fn get_channel_count(ctx: CallContext) -> Result<JsNumber> {
    let js_this = ctx.this_unchecked::<JsObject>();
    let napi_node = ctx.env.unwrap::<${d.napiName(d.node)}>(&js_this)?;
    let node = napi_node.unwrap();

    let channel_count = node.channel_count() as f64;

    ctx.env.create_double(channel_count)
}

#[js_function(1)]
fn set_channel_count(ctx: CallContext) -> Result<JsUndefined> {
    let js_this = ctx.this_unchecked::<JsObject>();
    let napi_node = ctx.env.unwrap::<${d.napiName(d.node)}>(&js_this)?;
    let node = napi_node.unwrap();

    let channel_count = ctx.get::<JsNumber>(0)?.get_double()? as usize;
    node.set_channel_count(channel_count);

    ctx.env.get_undefined()
}

#[js_function]
fn get_channel_count_mode(ctx: CallContext) -> Result<JsString> {
    let js_this = ctx.this_unchecked::<JsObject>();
    let napi_node = ctx.env.unwrap::<${d.napiName(d.node)}>(&js_this)?;
    let node = napi_node.unwrap();

    let value = node.channel_count_mode();
    let value_str = match value {
        ChannelCountMode::Max => "max",
        ChannelCountMode::ClampedMax => "clamped-max",
        ChannelCountMode::Explicit => "explicit",
    };

    ctx.env.create_string(value_str)
}

#[js_function(1)]
fn set_channel_count_mode(ctx: CallContext) -> Result<JsUndefined> {
    let js_this = ctx.this_unchecked::<JsObject>();
    let napi_node = ctx.env.unwrap::<${d.napiName(d.node)}>(&js_this)?;
    let node = napi_node.unwrap();

    let js_str = ctx.get::<JsString>(0)?;
    let utf8_str = js_str.into_utf8()?.into_owned()?;
    let value = match utf8_str.as_str() {
        "max" => ChannelCountMode::Max,
        "clamped-max" => ChannelCountMode::ClampedMax,
        "explicit" => ChannelCountMode::Explicit,
        _ => panic!("TypeError - The provided value '{:?}' is not a valid enum value of type ChannelCountMode", utf8_str.as_str()),
    };
    node.set_channel_count_mode(value);

    ctx.env.get_undefined()
}

#[js_function]
fn get_channel_interpretation(ctx: CallContext) -> Result<JsString> {
    let js_this = ctx.this_unchecked::<JsObject>();
    let napi_node = ctx.env.unwrap::<${d.napiName(d.node)}>(&js_this)?;
    let node = napi_node.unwrap();

    let value = node.channel_interpretation();
    let value_str = match value {
        ChannelInterpretation::Speakers => "speakers",
        ChannelInterpretation::Discrete => "discrete",
    };

    ctx.env.create_string(value_str)
}

#[js_function(1)]
fn set_channel_interpretation(ctx: CallContext) -> Result<JsUndefined> {
    let js_this = ctx.this_unchecked::<JsObject>();
    let napi_node = ctx.env.unwrap::<${d.napiName(d.node)}>(&js_this)?;
    let node = napi_node.unwrap();

    let js_str = ctx.get::<JsString>(0)?;
    let utf8_str = js_str.into_utf8()?.into_owned()?;
    let value = match utf8_str.as_str() {
        "speakers" => ChannelInterpretation::Speakers,
        "discrete" => ChannelInterpretation::Discrete,
        _ => panic!("TypeError - The provided value '{:?}' is not a valid enum value of type ChannelInterpretation", utf8_str.as_str()),
    };
    node.set_channel_interpretation(value);

    ctx.env.get_undefined()
}

#[js_function]
fn get_number_of_inputs(ctx: CallContext) -> Result<JsNumber> {
    let js_this = ctx.this_unchecked::<JsObject>();
    let napi_node = ctx.env.unwrap::<${d.napiName(d.node)}>(&js_this)?;
    let node = napi_node.unwrap();

    let number_of_inputs = node.number_of_inputs() as f64;

    ctx.env.create_double(number_of_inputs)
}

#[js_function]
fn get_number_of_outputs(ctx: CallContext) -> Result<JsNumber> {
    let js_this = ctx.this_unchecked::<JsObject>();
    let napi_node = ctx.env.unwrap::<${d.napiName(d.node)}>(&js_this)?;
    let node = napi_node.unwrap();

    let number_of_outputs = node.number_of_outputs() as f64;

    ctx.env.create_double(number_of_outputs)
}


// -------------------------------------------------
// connect / disconnect macros
// -------------------------------------------------
connect_method!(${d.napiName(d.node)});
disconnect_method!(${d.napiName(d.node)});

// -------------------------------------------------
// AudioScheduledSourceNode Interface
// -------------------------------------------------
${d.parent(d.node) === 'AudioScheduledSourceNode' ?
`
    ${d.name(d.node) !== 'AudioBufferSourceNode' ?
`#[js_function(1)]` :
`#[js_function(3)]`
}
fn start(ctx: CallContext) -> Result<JsUndefined> {
    let js_this = ctx.this_unchecked::<JsObject>();
    let napi_node = ctx.env.unwrap::<${d.napiName(d.node)}>(&js_this)?;
    let node = napi_node.unwrap();

${d.name(d.node) !== 'AudioBufferSourceNode' ?
`
    match ctx.length {
        0 => node.start(),
        1 => {
            let when = ctx.get::<JsObject>(0)?.coerce_to_number()?.get_double()?;
            node.start_at(when);
        }
        _ => (),
    }
` : `
    match ctx.length {
        0 => node.start(),
        1 => {
            let when = ctx.get::<JsObject>(0)?.coerce_to_number()?.get_double()?;
            node.start_at(when);
        }
        2 => {
            let when = ctx.get::<JsObject>(0)?.coerce_to_number()?.get_double()?;
            let offset = ctx.get::<JsObject>(1)?.coerce_to_number()?.get_double()?;
            node.start_at_with_offset(when, offset);
        }
        3 => {
            let when = ctx.get::<JsObject>(0)?.coerce_to_number()?.get_double()?;
            let offset = ctx.get::<JsObject>(1)?.coerce_to_number()?.get_double()?;
            let duration = ctx.get::<JsObject>(2)?.coerce_to_number()?.get_double()?;
            node.start_at_with_offset_and_duration(when, offset, duration);
        }
        _ => (),
    }
`}
    ctx.env.get_undefined()
}

#[js_function(1)]
fn stop(ctx: CallContext) -> Result<JsUndefined> {
    let js_this = ctx.this_unchecked::<JsObject>();
    let napi_node = ctx.env.unwrap::<${d.napiName(d.node)}>(&js_this)?;
    let node = napi_node.unwrap();

    match ctx.length {
        0 => node.stop(),
        1 => {
            let when = ctx.get::<JsObject>(0)?.coerce_to_number()?.get_double()?;
            node.stop_at(when);
        }
        _ => (),
    };

    ctx.env.get_undefined()
}

// ----------------------------------------------------
// Private Event Target initialization
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
            // do nothing for now as the listeners are never cleaned up which
            // prevent the process to close properly

            // let napi_context = ctx.env.unwrap::<NapiOfflineAudioContext>(&js_audio_context)?;
            // let store_id = napi_context.store_thread_safe_listener(tsfn.clone());
            // let napi_context = napi_context.clone();

            // node.set_onended(move |e| {
            //     tsfn.call(Ok(e), ThreadsafeFunctionCallMode::Blocking);
            //     napi_context.clear_thread_safe_listener(store_id);
            // });
        }
        &_ => unreachable!(),
    };

    ctx.env.get_undefined()
}
`
: ``
}

// -------------------------------------------------
// GETTERS
// -------------------------------------------------
${d.attributes(d.node).map(attr => {
    const attrType = d.memberType(attr);

    switch (attrType) {
        case 'boolean':
            return `
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
        case 'float':
            return `
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
        case 'double':
            return `
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
        case 'unsigned long':
            return `
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
        case 'Float32Array':
                    return `
#[js_function(0)]
fn get_${d.slug(attr)}(ctx: CallContext) -> Result<JsUnknown> {
    let js_this = ctx.this_unchecked::<JsObject>();

    if js_this.has_named_property("__${d.slug(attr)}__")? {
        Ok(js_this.get_named_property::<JsObject>("__${d.slug(attr)}__")?.into_unknown())
    } else {
        Ok(ctx.env.get_null()?.into_unknown())
    }
}
                    `;
            break;
        // IDL types
        default: {
            // handle MediaStream
            if (attr.idlType.type === 'attribute-type' && attr.idlType.idlType === 'MediaStream') {
                console.log('!!!! ignored getter for MediaStream ');
                return ``;
            }

            // handle IDL types
            let idl = d.findInTree(attrType);
            let idlType;

            try {
                idlType = d.type(idl);
            } catch(err) {
                console.log('issue in getter');
                console.log(JSON.stringify(attr, null, 2));
                return '';
            }

            switch (idlType) {
                case 'enum':
                    return `
#[js_function(0)]
fn get_${d.slug(attr)}(ctx: CallContext) -> Result<JsString> {
    let js_this = ctx.this_unchecked::<JsObject>();
    let napi_node = ctx.env.unwrap::<${d.napiName(d.node)}>(&js_this)?;
    let node = napi_node.unwrap();

    let value = node.${d.slug(attr, true)}();
    let js_value = match value {${idl.values.map(v => `
        ${idl.name}::${d.camelcase(v.value)} => "${v.value}",`).join('')}
    };

    ctx.env.create_string(js_value)
}
                    `;
                    break;
                case 'interface':
                    return `
#[js_function(0)]
fn get_${d.slug(attr)}(ctx: CallContext) -> Result<JsUnknown> {
    let js_this = ctx.this_unchecked::<JsObject>();

    if js_this.has_named_property("__${d.slug(attr)}__")? {
        Ok(js_this.get_named_property::<JsObject>("__${d.slug(attr)}__")?.into_unknown())
    } else {
        Ok(ctx.env.get_null()?.into_unknown())
    }
}
                    `;
                    break;
                default:
                    console.log(`[WARNING] getter for ${attr} with type ${attrType}/${idlType} not parsed`);
                    break;
            }
            break;
        }
    }
}).join('')}

// -------------------------------------------------
// SETTERS
// -------------------------------------------------
${d.attributes(d.node).map(attr => {
    if (attr.readonly) return;

    let attrType = d.memberType(attr);

    switch (attrType) {
        case 'boolean':
            return `
#[js_function(1)]
fn set_${d.slug(attr)}(ctx: CallContext) -> Result<JsUndefined> {
    let js_this = ctx.this_unchecked::<JsObject>();
    let napi_node = ctx.env.unwrap::<${d.napiName(d.node)}>(&js_this)?;
    let node = napi_node.unwrap();

    let value = ctx.get::<JsObject>(0)?.coerce_to_bool()?.try_into()?;
    node.set_${d.slug(attr)}(value);

    ctx.env.get_undefined()
}
            `;
            break;
        case 'float':
            return `
#[js_function(1)]
fn set_${d.slug(attr)}(ctx: CallContext) -> Result<JsUndefined> {
    let js_this = ctx.this_unchecked::<JsObject>();
    let napi_node = ctx.env.unwrap::<${d.napiName(d.node)}>(&js_this)?;
    let node = napi_node.unwrap();

    let value = ctx.get::<JsObject>(0)?.coerce_to_number()?.get_double()? as f32;
    node.set_${d.slug(attr)}(value);

    ctx.env.get_undefined()
}
            `;
            break;
        case 'double':
            return `
#[js_function(1)]
fn set_${d.slug(attr)}(ctx: CallContext) -> Result<JsUndefined> {
    let js_this = ctx.this_unchecked::<JsObject>();
    let napi_node = ctx.env.unwrap::<${d.napiName(d.node)}>(&js_this)?;
    let node = napi_node.unwrap();

    let value = ctx.get::<JsObject>(0)?.coerce_to_number()?.get_double()?;
    node.set_${d.slug(attr)}(value);

    ctx.env.get_undefined()
}
            `;
            break;
        case 'unsigned long':
            return `
#[js_function(1)]
fn set_${d.slug(attr)}(ctx: CallContext) -> Result<JsUndefined> {
    let js_this = ctx.this_unchecked::<JsObject>();
    let napi_node = ctx.env.unwrap::<${d.napiName(d.node)}>(&js_this)?;
    let node = napi_node.unwrap();

    let value = ctx.get::<JsObject>(0)?.coerce_to_number()?.get_double()? as usize;
    node.set_${d.slug(attr)}(value);

    ctx.env.get_undefined()
}
            `;
            break;
        case 'Float32Array':
            return `
#[js_function(1)]
fn set_${d.slug(attr)}(ctx: CallContext) -> Result<JsUndefined> {
    let mut js_this = ctx.this_unchecked::<JsObject>();
    let napi_node = ctx.env.unwrap::<${d.napiName(d.node)}>(&js_this)?;
    let node = napi_node.unwrap();

    let js_obj = ctx.get::<JsTypedArray>(0)?;
    let buffer = js_obj.into_value()?;
    let buffer_ref: &[f32] = buffer.as_ref();
    // @todo - remove this vec![]
    node.set_${d.slug(attr)}(buffer_ref.to_vec());
    // weird but seems we can have twice the same owned value...
    let js_obj = ctx.get::<JsTypedArray>(0)?;
    // store in "private" field for getter (not very clean, to review)
    js_this.set_named_property("__${d.slug(attr)}__", js_obj)?;

    ctx.env.get_undefined()
}
            `;
            break;

        // IDL types
        default: {
            let idl = d.findInTree(attrType);
            let idlType;

            // for debugging
            try {
                idlType = d.type(idl);
            } catch(err) {
                console.log('issue in setter');
                console.log(JSON.stringify(attr, null, 2));
                return '';
            }

            switch (idlType) {
                case 'enum':
                    return `
#[js_function(1)]
fn set_${d.slug(attr)}(ctx: CallContext) -> Result<JsUndefined> {
    let js_this = ctx.this_unchecked::<JsObject>();
    let napi_node = ctx.env.unwrap::<${d.napiName(d.node)}>(&js_this)?;
    let node = napi_node.unwrap();

    let js_str = ctx.get::<JsObject>(0)?.coerce_to_string()?;
    let utf8_str = js_str.into_utf8()?.into_owned()?;
    let value = match utf8_str.as_str() {${idl.values.map(v => `
        "${v.value}" => ${idl.name}::${d.camelcase(v.value)},`).join('')}
        _ => return ctx.env.get_undefined(),
    };

    node.set_${d.slug(attr)}(value);

    ctx.env.get_undefined()
}
                    `;
                    break
                case 'interface': // AudioBuffer
                    console.log(attr);
                    return `
#[js_function(1)]
fn set_${d.slug(attr)}(ctx: CallContext) -> Result<JsUndefined> {
    let mut js_this = ctx.this_unchecked::<JsObject>();
    let napi_node = ctx.env.unwrap::<${d.napiName(d.node)}>(&js_this)?;
    let node = napi_node.unwrap();

    let js_obj = ctx.get::<JsObject>(0)?;
    let napi_obj = ctx.env.unwrap::<${d.napiName(idl)}>(&js_obj)?;
    let obj = napi_obj.unwrap();
    node.set_${d.slug(attr)}(obj.clone());
    // store in "private" field for getter (not very clean, to review)
    js_this.set_named_property("__${d.slug(attr)}__", js_obj)?;

    ctx.env.get_undefined()
}
                    `;
                    break;
                default:
                    console.log(`[WARNING] getter for ${attr} with type ${attrType}/${idlType} not parsed`);
                    break;
            }
            break;
        }
    }
}).join('')}

// -------------------------------------------------
// METHODS
// -------------------------------------------------
${d.methods(d.node).map(method => {
if (method.idlType.idlType !== 'undefined') {
    console.log(`[WARNING] return type ${method.idlType.idlType} for method ${method.name} not parsed`);
    return '';
}

let doWriteMethodCall = true;

return `
#[js_function(${method.arguments.length})]
fn ${d.slug(method)}(ctx: CallContext) -> Result<JsUndefined> {
    let js_this = ctx.this_unchecked::<JsObject>();
    let napi_node = ctx.env.unwrap::<${d.napiName(d.node)}>(&js_this)?;
    // avoid warnings while we don't support all methods
    #[allow(unused_variables)]
    let node = napi_node.unwrap();

    ${method.arguments.map((arg, index) => {
        switch (d.memberType(arg)) {
            case 'float':
                return `
    let ${d.slug(arg.name)}_js = ctx.get::<JsObject>(${index})?.coerce_to_number()?;
    let ${d.slug(arg.name)} = ${d.slug(arg.name)}_js.get_double()? as f32;
                `;
                break;
            case 'double':
                return `
    let ${d.slug(arg.name)}_js = ctx.get::<JsObject>(${index})?.coerce_to_number()?;
    let ${d.slug(arg.name)} = ${d.slug(arg.name)}_js.get_double()? as f64;
                `;
                break;
            case 'Float32Array':
                return `
    let mut ${d.slug(arg.name)}_js = ctx.get::<JsTypedArray>(${index})?.into_value()?;
    let ${d.slug(arg.name)}: &mut [f32] = ${d.slug(arg.name)}_js.as_mut();
                `;
                break;
            case 'Uint8Array':
                return `
    let mut ${d.slug(arg.name)}_js = ctx.get::<JsTypedArray>(${index})?.into_value()?;
    let ${d.slug(arg.name)}: &mut [u8] = ${d.slug(arg.name)}_js.as_mut();
                `;
                break;
            default:
                let idl = d.findInTree(d.memberType(arg));

                // this is a not implemented primitive
                if (idl === undefined) {
                    console.log(`[method] argument ${arg.name} for method ${method.name} with type ${d.memberType(arg)} not parsed`);
                    doWriteMethodCall = false;
                } else {
                    switch (d.type(idl)) {
                        case 'interface':
                            return `
        let ${d.slug(arg.name)}_js = ctx.get::<JsObject>(${index})?;
        let ${d.slug(arg.name)}_napi = ctx.env.unwrap::<${d.napiName(idl)}>(&${d.slug(arg.name)}_js)?;
        let ${d.slug(arg.name)} = ${d.slug(arg.name)}_napi.unwrap().clone();
                            `;
                            break;
                        default:
                            console.log(`[method] argument ${arg.name} for method ${method.name} with type ${d.memberType(arg)} not parsed`);
                            doWriteMethodCall = false;
                            break;
                    }
                }
                break;

        }
    }).join('')}

    ${doWriteMethodCall ?
    `node.${d.slug(method)}(${method.arguments.map(arg => d.slug(arg.name)).join(', ')});` :
    ``
    }

    ctx.env.get_undefined()
}
`;
}).join('')}

