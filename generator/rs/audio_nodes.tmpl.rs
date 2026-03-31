use napi::bindgen_prelude::*;
use napi_derive::napi;

use web_audio_api::node::*;

use crate::*;

#[napi]
pub struct ${d.napiName(d.node)} {
    pub(crate) inner: ${d.name(d.node)},
}

audio_node_impl!(${d.napiName(d.node)});

#[napi]
impl ${d.napiName(d.node)} {
    // @todo - context: Either<&NapiAudioContext, &NapiOfflineAudioContext>
    #[napi(constructor)]
    pub fn new(mut this: This<Object>, context: &NapiAudioContext, options: Object) -> Self {
        // @todo - handle options
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
        let node_defaults = ${optionsType}::default();

                ${optionsIdl.members.map(member => {
                    const optionName = d.name(member);
                    const optionType = d.memberType(member);
                    const required = member.required;
                    const defaultValue = member.default; // null or object
                    const nullable = member.idlType.nullable; // only AudioBuffer is actually nullable
                    const simple_slug = d.slug(member);
                    const slug = d.slug(member, true); // append _ to protect from protected keywords

                    // Note that the options object has required member for AudioNodeOptions parsing
                    hasRequiredMember = hasRequiredMember || required;

                    switch (optionType) {
                        case "boolean": {
                            return `
        let some_${slug} = options.get::<Option<bool>>("${optionName}").unwrap();
        let ${slug} = if let Some(${slug}) = some_${slug}.unwrap() {
            ${slug}
        } else {
            node_defaults.${slug}
        };
                            `;
                            break;
                        }
                        case "float": {
                            return `
        let some_${slug} = options.get::<Option<f64>>("${optionName}").unwrap();
        let ${slug} = if let Some(${slug}) = some_${slug}.unwrap() {
            ${slug} as f32
        } else {
            node_defaults.${slug}
        };
                            `;
                            break;
                        }
                        case "double": {
                            return `
        let some_${slug} = options.get::<Option<f64>>("${optionName}").unwrap();
        let ${slug} = if let Some(${slug}) = some_${slug}.unwrap() {
            ${slug}
        } else {
            node_defaults.${slug}
        };
                            `;
                            break;
                        }
                        case "unsigned long": {
                            return `
        let some_${slug} = options.get::Option<<>u32>("${optionName}").unwrap();
        let ${slug} = if let Some(${slug}) = some_${slug}.unwrap() {
            ${slug} as usize
        } else {
            node_defaults.${slug}
        };
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
        let some_${slug} = options.get::<Option<String>>("${optionName}").unwrap();
        let ${slug} = if let Some(${slug}) = some_${slug}.unwrap() {
            match ${slug}.as_str() {${idl.values.map(v => `
                "${v.value}" => ${idl.name}::${d.camelcase(v.value)},`).join("")}
                _ => unreachable!(),
            }
        } else {
            node_defaults.${slug}
        };
                            `;
                            break;
                        }
                        // @fixme - napi-rs 3
                        // case "PeriodicWave":
                        case "AudioBuffer": {
                            const idl = d.findInTree(d.memberType(member));
                            return `
        let js_${slug} = options.get::<Option<ClassInstance<&NapiAudioBuffer>>>("${optionName}").unwrap();
        let ${slug} = if let Some(${slug}) = js_${slug}.unwrap() {
            Some(${slug}.inner.clone())
        } else {
            None
        };
                            `;
                            break;
                       }
                        case "MediaStream": {
                            const napiName = `Napi${member.idlType.idlType}`;
                            return `
        let ${slug} = node_defaults.${slug};
        // let ${simple_slug}_js = options.get::<&str, JsObject>("${optionName}")?.unwrap();
        // let ${simple_slug}_napi = ctx.env.unwrap::<${napiName}>(&${simple_slug}_js)?;
        // let ${slug} = ${simple_slug}_napi.unwrap();
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
        let ${slug} = node_defaults.${slug};
        // let ${simple_slug}_js = options.get::<&str, JsTypedArray>("${optionName}")?.unwrap();
        // let ${simple_slug}_value = ${simple_slug}_js.into_value()?;
        // let ${slug}: &[${targetType}] = ${simple_slug}_value.as_ref();
        // let ${slug} = ${slug}.to_vec();
                                `;
                            // - WaveShaperOptions::curve
                            } else {
                                return `
        let ${slug} = node_defaults.${slug};
        // let ${simple_slug}_js = options.get::<&str, JsUnknown>("${optionName}")?.unwrap();
        // let ${slug} = if ${simple_slug}_js.get_type()? == ValueType::Null {
        //     None
        // } else {
        //     let ${simple_slug}_js = options.get::<&str, JsTypedArray>("${optionName}")?.unwrap();
        //     let ${simple_slug}_value = ${simple_slug}_js.into_value()?;
        //     let ${slug}: &[${targetType}] = ${simple_slug}_value.as_ref();
        //     Some(${slug}.to_vec())
        // };
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
        // - Note that these are not enforced by JS facade
        // --------------------------------------------------------\
                `;
                // If the node options object has required member, e.g. IIRFilterNodeOptions,
                // then it does not implement Default. In this case we need to grab the default
                // directly from AudioNodeOptions
                if (hasRequiredMember) {
                    parseOptions += `
        let audio_node_options_default = AudioNodeOptions::default();
                    `;
                } else {
                    parseOptions += `
        // @fixme - napi-rs 3
        // let node_defaults = ${optionsType}::default();
        let audio_node_options_default = node_defaults.audio_node_options;
                    `;
                }

                parseOptions += `
        let some_channel_count = options.get::<u32>("channelCount").unwrap();
        let channel_count = if let Some(channel_count) = some_channel_count {
            channel_count as usize
        } else {
            audio_node_options_default.channel_count
        };

        let some_channel_count_mode = options.get::<String>("channelCountMode").unwrap();
        let channel_count_mode = if let Some(channel_count_mode) = some_channel_count_mode {
            match channel_count_mode.as_str() {
                "max" => ChannelCountMode::Max,
                "clamped-max" => ChannelCountMode::ClampedMax,
                "explicit" => ChannelCountMode::Explicit,
                _ => panic!("TypeError - Failed to read the 'channelCountMode' property from 'AudioNodeOptions': The provided value '{:?}' is not a valid enum value of type ChannelCountMode", channel_count_mode.as_str()),
            }
        } else {
            audio_node_options_default.channel_count_mode
        };

        let some_channel_interpretation = options.get::<String>("channelInterpretation").unwrap();
        let channel_interpretation = if let Some(channel_interpretation) = some_channel_interpretation {
            match channel_interpretation.as_str() {
                "speakers" => ChannelInterpretation::Speakers,
                "discrete" => ChannelInterpretation::Discrete,
                _ => panic!("TypeError - Failed to read the 'channelInterpretation' property from 'AudioNodeOptions': The provided value '{:?}' is not a valid enum value of type ChannelInterpretation", channel_interpretation.as_str()),
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
        // Create native instance
        // --------------------------------------------------------
        let native_context = context.unwrap();
        let native_node = ${d.name(d.node)}::new(native_context, options);

        // --------------------------------------------------------
        // Create and bind NapiAudioParam instances
        // --------------------------------------------------------
        ${d.audioParams(d.node).map((param) => {
            return `
                let native_param = native_node.${d.slug(param.name)}().clone();
                let napi_param = NapiAudioParam::new(native_param);
                let _ = this.set_named_property("${param.name}", napi_param);
            `;
        }).join('')}

        // create js instance
        Self { inner: native_node }
    }

    ${(function() {
        // -------------------------------------------------
        // AudioScheduledSourceNode Interface
        // @fixme - napi-rs 3 - ended event
        // -------------------------------------------------
        if (d.parent(d.node) !== "AudioScheduledSourceNode") {
            return ``;
        }

        let methods = ``;

        if (d.name(d.node) !== "AudioBufferSourceNode") {
            methods += `
    #[napi]
    pub fn start(&mut self, when: Option<f64>) {
        let when = when.unwrap_or(0.);
        self.inner.start_at(when);
    }
            `;
        } else {
            methods += `
    #[napi]
    pub fn start(&mut self, when: Option<f64>, offset: Option<f64>, duration: Option<f64>) {
        let when = when.unwrap_or(0.);
        let offset = offset.unwrap_or(0.);

        if !duration.is_some() {
            self.inner.start_at_with_offset(when, offset);
        } else {
            self.inner.start_at_with_offset_and_duration(when, offset, duration.unwrap());
        }

    }
            `;
        }

        methods += `
    #[napi]
    pub fn stop(&mut self, when: Option<f64>) {
        let when = when.unwrap_or(0.);
        self.inner.stop_at(when);
    }
        `;

        return methods;
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
    #[napi(getter, js_name = "${d.name(attr)}")]
    pub fn get_${d.slug(attr)}(&self) -> bool {
        self.inner.${d.slug(attr, true)}()
    }
                `;
                break;
            }
            case "float": {
                getter = `
    #[napi(getter, js_name = "${d.name(attr)}")]
    pub fn get_${d.slug(attr)}(&self) -> f64 {
        self.inner.${d.slug(attr, true)}() as f64
    }
                `;
                break;
            }
            case "double": {
                getter = `
    #[napi(getter, js_name = "${d.name(attr)}")]
    pub fn get_${d.slug(attr)}(&self) -> f64 {
        self.inner.${d.slug(attr, true)}()
    }
                `;
                break;
            }
            case "unsigned long": {
                getter = `
    #[napi(getter, js_name = "${d.name(attr)}")]
    pub fn get_${d.slug(attr)}(&self) -> u32 {
        self.inner.${d.slug(attr, true)}()
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
    #[napi(getter, js_name = "${d.name(attr)}")]
    pub fn get_${d.slug(attr)}(&self) -> String {
        let value = self.inner.${d.slug(attr, true)}();
        let value = match value {${typeIdl.values.map(v => `
            ${typeIdl.name}::${d.camelcase(v.value)} => "${v.value}",`).join("")}
        };

        String::from(value)
    }
                `;
                break;
            }
    //         case "Float32Array": {
    //             // WaveShaperNode::curve
    //             getter = `
    // #[js_function(0)]
    // fn get_${d.slug(attr)}(ctx: CallContext) -> Result<JsUnknown> {
    //     let js_this = ctx.this_unchecked::<JsObject>();
    //     let napi_node = ctx.env.unwrap::<${d.napiName(d.node)}>(&js_this)?;
    //     let node = napi_node.unwrap();

    //     let value = node.${d.slug(attr, true)}();

    //     if let Some(arr_f32) = value {
    //         let length = arr_f32.len();

    //         let array_buffer = ctx.env.create_arraybuffer(length * 4).unwrap();
    //         let js_typed_array = array_buffer
    //             .into_raw()
    //             .into_typedarray(TypedArrayType::Float32, length, 0)?;

    //         let mut js_typed_array_value = js_typed_array.into_value()?;
    //         let buffer: &mut [f32] = js_typed_array_value.as_mut();
    //         buffer.copy_from_slice(arr_f32);

    //         let js_typed_array = js_typed_array_value.arraybuffer
    //             .into_typedarray(TypedArrayType::Float32, length, 0)?;

    //         Ok(js_typed_array.into_unknown())
    //     } else {
    //         Ok(ctx.env.get_null()?.into_unknown())
    //     }
    // }
    //                     `;
    //             break;
    //         }
            case "AudioBuffer": {
                // This should never be called as the AudioBuffer is stored directly
                // on the JS side to retrieve the exact same AudioBuffer reference.
                // - AudioBufferSourceNode::buffer
                // - ConvolverNode::curve
                getter = `
    #[napi(getter, js_name = "${d.name(attr)}")]
    pub fn get_${d.slug(attr)}(&self) {
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
    #[napi(setter, js_name = "${d.name(attr)}")]
    pub fn set_${d.slug(attr)}(&mut self, value: bool) {
        self.inner.set_${d.slug(attr)}(value);
    }
                    `;
                    break;
                }
                case "float": {
                    setter = `
    #[napi(setter, js_name = "${d.name(attr)}")]
    pub fn set_${d.slug(attr)}(&mut self, value: f64) {
        self.inner.set_${d.slug(attr)}(value as f32);
    }
                    `;
                    break;
                }
                case "double": {
                    setter = `
    #[napi(setter, js_name = "${d.name(attr)}")]
    pub fn set_${d.slug(attr)}(&mut self, value: f64) {
        self.inner.set_${d.slug(attr)}(value);
    }
                    `;
                    break;
                }
                case "unsigned long": {
                    setter = `
    #[napi(setter, js_name = "${d.name(attr)}")]
    pub fn set_${d.slug(attr)}(&mut self, value: u32) {
        self.inner.set_${d.slug(attr)}(value);
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
    #[napi(setter, js_name = "${d.name(attr)}")]
    pub fn set_${d.slug(attr)}(&mut self, value: String) {
        let value = match value.as_str() {${typeIdl.values.map(v => `
            "${v.value}" => ${typeIdl.name}::${d.camelcase(v.value)},`).join("")}
            _ => unreachable!(),
        };

        self.inner.set_${d.slug(attr)}(value);
    }
                    `;
                    break;
                }
    //             case "Float32Array": {
    //                 // WaveShaperNode::curve
    //                 setter = `
    // #[js_function(1)]
    // fn set_${d.slug(attr)}(ctx: CallContext) -> Result<JsUndefined> {
    //     let js_this = ctx.this_unchecked::<JsObject>();
    //     let napi_node = ctx.env.unwrap::<${d.napiName(d.node)}>(&js_this)?;
    //     let node = napi_node.unwrap();

    //     let js_obj = ctx.get::<JsTypedArray>(0)?;
    //     let buffer = js_obj.into_value()?;
    //     let buffer_ref: &[f32] = buffer.as_ref();
    //     node.set_${d.slug(attr)}(buffer_ref.to_vec());

    //     ctx.env.get_undefined()
    // }
    //                 `;
    //                 break;
    //             }
                case "AudioBuffer": {
                    let typeIdl = d.findInTree(attrType);

                    setter = `
    #[napi(setter, js_name = "${d.name(attr)}")]
    pub fn set_${d.slug(attr)}(&mut self, value: &NapiAudioBuffer) {
        self.inner.set_${d.slug(attr)}(value.inner.clone());
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

}
