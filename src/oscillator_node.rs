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

use crate::*;

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

        let some_type_ = options.get::<Option<String>>("type").unwrap();
        let type_ = if let Some(type_) = some_type_.unwrap() {
            match type_.as_str() {
                "sine" => OscillatorType::Sine,
                "square" => OscillatorType::Square,
                "sawtooth" => OscillatorType::Sawtooth,
                "triangle" => OscillatorType::Triangle,
                "custom" => OscillatorType::Custom,
                _ => unreachable!(),
            }
        } else {
            node_defaults.type_
        };

        let some_frequency = options.get::<Option<f64>>("frequency").unwrap();
        let frequency = if let Some(frequency) = some_frequency.unwrap() {
            frequency as f32
        } else {
            node_defaults.frequency
        };

        let some_detune = options.get::<Option<f64>>("detune").unwrap();
        let detune = if let Some(detune) = some_detune.unwrap() {
            detune as f32
        } else {
            node_defaults.detune
        };

        let periodic_wave = node_defaults.periodic_wave;
        // let periodic_wave_js = options.get::<&str, JsUnknown>("periodicWave")?.unwrap();
        // let periodic_wave = if periodic_wave_js.get_type()? == ValueType::Null {
        //     None
        // } else {
        //     let periodic_wave_js = options.get::<&str, JsTypedArray>("periodicWave")?.unwrap();
        //     let periodic_wave_value = periodic_wave_js.into_value()?;
        //     let periodic_wave: &[f64] = periodic_wave_value.as_ref();
        //     Some(periodic_wave.to_vec())
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
    pub fn start(&mut self, when: Option<f64>) {
        let when = when.unwrap_or(0.);
        self.inner.start_at(when);
    }

    #[napi]
    pub fn stop(&mut self, when: Option<f64>) {
        let when = when.unwrap_or(0.);
        self.inner.stop_at(when);
    }

    // -------------------------------------------------
    // Getters / Setters
    // -------------------------------------------------

    #[napi(getter, js_name = "type")]
    pub fn get_type(&self) -> String {
        let value = self.inner.type_();
        let value = match value {
            OscillatorType::Sine => "sine",
            OscillatorType::Square => "square",
            OscillatorType::Sawtooth => "sawtooth",
            OscillatorType::Triangle => "triangle",
            OscillatorType::Custom => "custom",
        };

        String::from(value)
    }

    #[napi(setter, js_name = "type")]
    pub fn set_type(&mut self, value: String) {
        let value = match value.as_str() {
            "sine" => OscillatorType::Sine,
            "square" => OscillatorType::Square,
            "sawtooth" => OscillatorType::Sawtooth,
            "triangle" => OscillatorType::Triangle,
            "custom" => OscillatorType::Custom,
            _ => unreachable!(),
        };

        self.inner.set_type(value);
    }
}
