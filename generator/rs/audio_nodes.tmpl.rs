use napi::bindgen_prelude::*;
use napi_derive::napi;

use web_audio_api::node::*;

use crate::*;

#[napi(js_name = ${d.napiName(d.node)})]
pub struct ${d.napiName(d.node)} {
    pub(crate) inner: ${d.name(d.node)},
    ${d.audioParams(d.node).map((param) => {
        return `pub(crate) ${d.slug(param)}: NapiAudioParam,`;
    }).join('\n')}
}

audio_node_impl!(${d.napiName(d.node)});

#[napi]
impl ${d.napiName(d.node)} {
    // @todo - context: Either<&NapiAudioContext, &NapiOfflineAudioContext>
    #[napi(constructor)]
    pub fn new(
        context: Either<&NapiAudioContext, &NapiOfflineAudioContext>,
        options: Object
    ) -> Self {
        ${(function() {
            const optionsArg = d.constructor(d.node).arguments[1];
            const optionsType = d.memberType(optionsArg);
            const optionsIdl = d.findInTree(optionsType);
            let hasRequiredMember = optionsIdl.members.reduce((acc, member) => acc || member.required, false);
            let parseOptions = ``;

            parseOptions += `
        // --------------------------------------------------------
        // Parse ${optionsType}
        // by bindings construction all fields are populated on the JS side
        // --------------------------------------------------------
                ${!hasRequiredMember ? `
        let node_defaults: Option<${optionsType}> = Some(${optionsType}::default());
                ` : `
        let node_defaults: Option<${optionsType}> = None;
                `}

                ${optionsIdl.members.map(member => {
                    const optionName = d.name(member);
                    const optionType = d.memberType(member);
                    const defaultValue = member.default; // null or object
                    const nullable = member.idlType.nullable; // only AudioBuffer is actually nullable
                    const simple_slug = d.slug(member);
                    const slug = d.slug(member, true); // append _ to protect from protected keywords

                    switch (optionType) {
                        case "boolean": {
                            return `
        let some_${slug} = options.get::<Option<bool>>("${optionName}").unwrap();
        let ${slug} = if let Some(${slug}) = some_${slug}.unwrap() {
            ${slug}
        } else if node_defaults.is_some() {
            node_defaults.clone().unwrap().${slug}
        } else {
            panic!("No default value for ${slug} in ${optionsType}")
        };
                            `;
                            break;
                        }
                        case "float": {
                            return `
        let some_${slug} = options.get::<Option<f64>>("${optionName}").unwrap();
        let ${slug} = if let Some(${slug}) = some_${slug}.unwrap() {
            ${slug} as f32
        } else if node_defaults.is_some() {
            node_defaults.clone().unwrap().${slug}
        } else {
            panic!("No default value for ${slug} in ${optionsType}")
        };
                            `;
                            break;
                        }
                        case "double": {
                            return `
        let some_${slug} = options.get::<Option<f64>>("${optionName}").unwrap();
        let ${slug} = if let Some(${slug}) = some_${slug}.unwrap() {
            ${slug}
        } else if node_defaults.is_some() {
            node_defaults.clone().unwrap().${slug}
        } else {
            panic!("No default value for ${slug} in ${optionsType}")
        };
                            `;
                            break;
                        }
                        case "unsigned long": {
                            return `
        let some_${slug} = options.get::<Option<u32>>("${optionName}").unwrap();
        let ${slug} = if let Some(${slug}) = some_${slug}.unwrap() {
            ${slug} as usize
        } else if node_defaults.is_some() {
            node_defaults.clone().unwrap().${slug}
        } else {
            panic!("No default value for ${slug} in ${optionsType}")
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
        } else if node_defaults.is_some() {
            node_defaults.clone().unwrap().${slug}
        } else {
            panic!("No default value for ${slug} in ${optionsType}")
        };
                            `;
                            break;
                        }
                        case "PeriodicWave":
                        case "AudioBuffer": {
                            const idl = d.findInTree(d.memberType(member));
                            return `
        let js_${slug} = options.get::<Option<ClassInstance<Napi${optionType}>>>("${optionName}").unwrap();
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
        // @fixme - napi-rs 3
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
                            // - IIRFIlterOptions::feedforward (required)
                            // - IIRFIlterOptions::feedback (required)
                            // - WaveShaperOptions::curve
                            return `
        let some_${slug} = options.get::<Option<&[${targetType}]>>("${optionName}").unwrap();
        let ${slug} = if let Some(${slug}) = some_${slug}.unwrap() {
            ${member.required
                ? `${slug}.to_vec()`
                : `Some(${slug}.to_vec())`
            }

        } else if node_defaults.is_some() {
            node_defaults.clone().unwrap().${slug}
        } else {
            panic!("No default value for ${slug} in ${optionsType}")
        };
                            `;
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
        // --------------------------------------------------------
        let audio_node_options_default = match node_defaults {
            Some(node_defaults) => node_defaults.audio_node_options,
            None => AudioNodeOptions::default(),
        };

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
        let native_node = match context {
            Either::A(context) => {
                let native_context = context.unwrap();
                ${d.name(d.node)}::new(native_context, options)
            }
            Either::B(context) => {
                let native_context = context.unwrap();
                ${d.name(d.node)}::new(native_context, options)
            }
        };

        // --------------------------------------------------------
        // Bind NapiAudioParam instances
        // --------------------------------------------------------
        ${d.audioParams(d.node).map((param) => {
            return `
                let native_param = native_node.${d.slug(param.name)}().clone();
                let ${d.slug(param)} = NapiAudioParam::new(native_param);
            `;
        }).join('')}

        Self {
            inner: native_node,
            ${d.audioParams(d.node).map((param) => {
                return `${d.slug(param)}: ${d.slug(param)},`;
            }).join('\n')}
        }
    }

    ${d.audioParams(d.node).map((param) => {
        return `
    #[napi(getter)]
    pub fn ${d.slug(param.name)}(&self) -> NapiAudioParam {
        self.${d.slug(param.name)}.clone()
    }
        `;
    }).join('')}

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
    pub fn get_${d.slug(attr)}(&self) -> f32 {
        self.inner.${d.slug(attr, true)}()
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
        self.inner.${d.slug(attr, true)}() as u32
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
            // WaveShaperNode::curve
            case "Float32Array": {
                getter += `
    #[napi(getter, js_name = "${d.name(attr)}")]
    pub fn get_${d.slug(attr)}(&self) -> Either<Float32Array, Null> {
        let value = self.inner.${d.slug(attr, true)}();

        match value {
            Some(value) => Either::A(Float32Array::new(value.to_vec())),
            None => Either::B(Null)
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
        self.inner.set_${d.slug(attr)}(value as usize);
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

                // WaveShaperNode::curve
                case "Float32Array": {
                    setter += `
    #[napi(setter, js_name = "${d.name(attr)}")]
    pub fn set_${d.slug(attr)}(&mut self, value: &[f32]) {
        self.inner.set_${d.slug(attr)}(value.to_vec());
    }
                    `
                    break;
                }
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

    ${d.methods(d.node).length > 0 ? `
    // -------------------------------------------------
    // METHODS
    // -------------------------------------------------\
    ` : ``}
    ${d.methods(d.node).map(method => {
        let args = method.arguments.map((arg, index) => {
            const attrType = d.memberType(arg);

            switch (attrType) {
                case 'float':
                    return `${d.slug(arg.name)}: f64`;
                case 'Float32Array':
                    return `mut ${d.slug(arg.name)}: Float32ArraySlice`;
                case 'Uint8Array':
                    return `mut ${d.slug(arg.name)}: Uint8ArraySlice`;
                case 'PeriodicWave':
                    return `${d.slug(arg.name)}: &NapiPeriodicWave`;
            }
        });
        return `
    #[napi]
    pub fn ${d.slug(method)}(&mut self, ${args.join(', ')}) {
        ${method.arguments.map((arg, index) => {
            const attrType = d.memberType(arg);

            switch (attrType) {
                case 'float':
                    return `let ${d.slug(arg.name)} = ${d.slug(arg.name)} as f32;`;
                case 'Float32Array': // analyser node
                    return `let ${d.slug(arg.name)} = unsafe { ${d.slug(arg.name)}.as_mut() };`;
                case 'Uint8Array': // analyser node
                    return `let ${d.slug(arg.name)} = unsafe { ${d.slug(arg.name)}.as_mut() };`;
                case 'PeriodicWave':
                    return `let ${d.slug(arg.name)} = ${d.slug(arg.name)}.inner.clone();`;
            }
        }).join('\n')};
        self.inner.${d.slug(method)}(${method.arguments.map(arg => d.slug(arg.name)).join(', ')});
    }
        `;
    }).join('')}
}
