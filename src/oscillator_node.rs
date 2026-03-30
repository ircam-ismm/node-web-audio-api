// -------------------------------------------------------------------------- //
// -------------------------------------------------------------------------- //
//                                                                            //
//                                                                            //
//                                                                            //
//    ██╗    ██╗ █████╗ ██████╗ ███╗   ██╗██╗███╗   ██╗ ██████╗               //
//    ██║    ██║██╔══██╗██╔══██╗████╗  ██║██║████╗  ██║██╔════╝               //
//    ██║ █╗ ██║███████║██████╔╝██╔██╗ ██║██║██╔██╗ ██║██║  ███╗              //
//    ██║███╗██║██╔══██║██╔══██╗██║╚██╗██║██║██║╚██╗██║██║   ██║              //
//    ╚███╔███╔╝██║  ██║██║  ██║██║ ╚████║██║██║ ╚████║╚██████╔╝              //
//     ╚══╝╚══╝ ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═══╝╚═╝╚═╝  ╚═══╝ ╚═════╝               //
//                                                                            //
//                                                                            //
//    - This file has been generated ---------------------------              //
//                                                                            //
//                                                                            //
// -------------------------------------------------------------------------- //
// -------------------------------------------------------------------------- //

use napi::bindgen_prelude::*;
use napi_derive::napi;

use web_audio_api::node::*;

use crate::NapiAudioContext;
use crate::NapiAudioParam;

#[napi]
pub struct NapiOscillatorNode {
    pub(crate) inner: OscillatorNode,
}

audio_node_impl!(NapiOscillatorNode);

#[napi]
impl NapiOscillatorNode {
    // @todo - context: Either<&NapiAudioContext, &NapiOfflineAudioContext>
    #[napi(constructor)]
    pub fn new(mut this: This<Object>, context: &NapiAudioContext, options: Object) -> Self {
        // @todo - handle options

        // --------------------------------------------------------
        // Parse OscillatorOptions
        // by bindings construction all fields are populated on the JS side
        // --------------------------------------------------------
        let node_defaults = OscillatorOptions::default();

        let js_type = options.get::<String>("type").unwrap().unwrap();
        let type_ = match js_type.as_str() {
            "sine" => OscillatorType::Sine,
            "square" => OscillatorType::Square,
            "sawtooth" => OscillatorType::Sawtooth,
            "triangle" => OscillatorType::Triangle,
            "custom" => OscillatorType::Custom,
            _ => unreachable!(),
        };

        let some_frequency = options.get::<f64>("frequency").unwrap();
        let frequency = if let Some(frequency) = some_frequency {
            frequency as f32
        } else {
            node_defaults.frequency
        };

        let some_detune = options.get::<f64>("detune").unwrap();
        let detune = if let Some(detune) = some_detune {
            detune as f32
        } else {
            node_defaults.detune
        };

        let periodic_wave = node_defaults.periodic_wave;
        // let periodic_wave_js = options.get::<&str, JsUnknown>("periodicWave")?.unwrap();
        // let periodic_wave = match periodic_wave_js.get_type()? {
        //     ValueType::Object => {
        //         let periodic_wave_js = periodic_wave_js.coerce_to_object()?;
        //         let periodic_wave_napi = ctx.env.unwrap::<NapiPeriodicWave>(&periodic_wave_js)?;
        //         Some(periodic_wave_napi.unwrap().clone())
        //     },
        //     ValueType::Null => None,
        //     _ => unreachable!(),
        // };

        // --------------------------------------------------------
        // Parse AudioNodeOptions
        // - Note that these are not enforced by JS facade
        // --------------------------------------------------------
        // @fixme - napi-rs 3
        // let node_defaults = OscillatorOptions::default();
        let audio_node_options_default = node_defaults.audio_node_options;

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
        let channel_interpretation = if let Some(channel_interpretation) =
            some_channel_interpretation
        {
            match channel_interpretation.as_str() {
                "speakers" => ChannelInterpretation::Speakers,
                "discrete" => ChannelInterpretation::Discrete,
                _ => panic!("TypeError - Failed to read the 'channelInterpretation' property from 'AudioNodeOptions': The provided value '{:?}' is not a valid enum value of type ChannelInterpretation", channel_interpretation.as_str()),
            }
        } else {
            audio_node_options_default.channel_interpretation
        };

        // --------------------------------------------------------
        // Create OscillatorOptions object
        // --------------------------------------------------------
        let options = OscillatorOptions {
            type_,
            frequency,
            detune,
            periodic_wave,
            audio_node_options: AudioNodeOptions {
                channel_count,
                channel_count_mode,
                channel_interpretation,
            },
        };

        // --------------------------------------------------------
        // Create native instance
        // --------------------------------------------------------
        let native_context = context.unwrap();
        let native_node = OscillatorNode::new(native_context, options);

        // --------------------------------------------------------
        // Create and bind NapiAudioParam instances
        // --------------------------------------------------------

        let native_param = native_node.frequency().clone();
        let napi_param = NapiAudioParam::new(native_param);
        let _ = this.set_named_property("frequency", napi_param);

        let native_param = native_node.detune().clone();
        let napi_param = NapiAudioParam::new(native_param);
        let _ = this.set_named_property("detune", napi_param);

        // create js instance
        Self { inner: native_node }
    }

    #[napi]
    pub fn start(&mut self, when: f64) {
        self.inner.start_at(when);
    }

    #[napi]
    pub fn stop(&mut self, when: f64) {
        self.inner.stop_at(when);
    }
}
