use napi::bindgen_prelude::*;
use napi_derive::napi;

use web_audio_api::node::*;

use crate::NapiAudioContext;
use crate::NapiAudioParam;

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
        let some_${slug} = options.get::<Boolean>("${optionName}").unwrap();
        let ${slug} = if let Some(${slug}) = some_${slug} {
            ${slug}
        } else {
            node_defaults.${slug}
        };
                            `;
                            break;
                        }
                        case "float": {
                            return `
        let some_${slug} = options.get::<f64>("${optionName}").unwrap();
        let ${slug} = if let Some(${slug}) = some_${slug} {
            ${slug} as f32
        } else {
            node_defaults.${slug}
        };
                            `;
                            break;
                        }
                        case "double": {
                            return `
        let ${slug} = options.get::<f64>("${optionName}").unwrap();
        let ${slug} = if let Some(${slug}) = some_${slug} {
            ${slug}
        } else {
            node_defaults.${slug}
        };
                            `;
                            break;
                        }
                        case "unsigned long": {
                            return `
        let ${slug} = options.get::<u32>("${optionName}").unwrap();
        let ${slug} = if let Some(${slug}) = some_${slug} {
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
        let js_${simple_slug} = options.get::<String>("${optionName}").unwrap().unwrap();
        let ${slug} = match js_${simple_slug}.as_str() {${idl.values.map(v => `
            "${v.value}" => ${idl.name}::${d.camelcase(v.value)},`).join("")}
            _ => unreachable!(),
        };
                            `;
                            break;
                        }
        // @fixme - napi-rs 3
                        // default values are null
                        case "PeriodicWave":
                        case "AudioBuffer": {
                            const idl = d.findInTree(d.memberType(member));
                            return `
        let ${slug} = node_defaults.${slug};
        // let ${simple_slug}_js = options.get::<&str, JsUnknown>("${optionName}")?.unwrap();
        // let ${slug} = match ${simple_slug}_js.get_type()? {
        //     ValueType::Object => {
        //         let ${simple_slug}_js = ${simple_slug}_js.coerce_to_object()?;
        //         let ${simple_slug}_napi = ctx.env.unwrap::<${d.napiName(idl)}>(&${simple_slug}_js)?;
        //         Some(${simple_slug}_napi.unwrap().clone())
        //     },
        //     ValueType::Null => None,
        //     _ => unreachable!(),
        // };
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
    pub fn start(&mut self, when: f64) {
        self.inner.start_at(when);
    }
            `;
        } else {
            methods += `
    #[napi]
    pub fn start(&mut self, when: f64, offset: f64, duration: f64) {
        self.inner.start_at_with_offset_and_duration(when, offset, duration);
    }
            `;
        }

        methods += `
    #[napi]
    pub fn stop(&mut self, when: f64) {
        self.inner.stop_at(when);
    }
        `;

        return methods;
    }())}
}
