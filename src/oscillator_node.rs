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

#[napi(js_name = NapiOscillatorNode)]
pub struct NapiOscillatorNode {
    pub(crate) inner: OscillatorNode,
    pub(crate) param_frequency: NapiAudioParam,
    pub(crate) param_detune: NapiAudioParam,
}

audio_node_impl!(NapiOscillatorNode);

#[napi]
impl NapiOscillatorNode {
    // @todo - context: Either<&NapiAudioContext, &NapiOfflineAudioContext>
    #[napi(constructor)]
    pub fn new(
        context: Either<&NapiAudioContext, &NapiOfflineAudioContext>,
        options: Object,
    ) -> Self {
        // @todo - finish options handling

        // --------------------------------------------------------
        // Parse OscillatorOptions
        // by bindings construction all fields are populated on the JS side
        // --------------------------------------------------------

        let node_defaults: Option<OscillatorOptions> = Some(OscillatorOptions::default());

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
        } else if node_defaults.is_some() {
            node_defaults.clone().unwrap().type_
        } else {
            panic!("No default value for type_ in OscillatorOptions")
        };

        let some_frequency = options.get::<Option<f64>>("frequency").unwrap();
        let frequency = if let Some(frequency) = some_frequency.unwrap() {
            frequency as f32
        } else if node_defaults.is_some() {
            node_defaults.clone().unwrap().frequency
        } else {
            panic!("No default value for frequency in OscillatorOptions")
        };

        let some_detune = options.get::<Option<f64>>("detune").unwrap();
        let detune = if let Some(detune) = some_detune.unwrap() {
            detune as f32
        } else if node_defaults.is_some() {
            node_defaults.clone().unwrap().detune
        } else {
            panic!("No default value for detune in OscillatorOptions")
        };

        let js_periodic_wave = options
            .get::<Option<ClassInstance<NapiPeriodicWave>>>("periodicWave")
            .unwrap();
        let periodic_wave = if let Some(periodic_wave) = js_periodic_wave.unwrap() {
            Some(periodic_wave.inner.clone())
        } else {
            None
        };

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
        let native_node = match context {
            Either::A(context) => {
                let native_context = context.unwrap();
                OscillatorNode::new(native_context, options)
            }
            Either::B(context) => {
                let native_context = context.unwrap();
                OscillatorNode::new(native_context, options)
            }
        };

        // --------------------------------------------------------
        // Create and bind NapiAudioParam instances
        // --------------------------------------------------------

        let native_param = native_node.frequency().clone();
        let param_frequency = NapiAudioParam::new(native_param);

        let native_param = native_node.detune().clone();
        let param_detune = NapiAudioParam::new(native_param);

        // create js instance
        Self {
            inner: native_node,
            param_frequency: param_frequency,
            param_detune: param_detune,
        }
    }

    #[napi(getter)]
    pub fn frequency(&self) -> NapiAudioParam {
        self.param_frequency.clone()
    }

    #[napi(getter)]
    pub fn detune(&self) -> NapiAudioParam {
        self.param_detune.clone()
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

    // -------------------------------------------------
    // METHODS
    // -------------------------------------------------

    #[napi]
    pub fn set_periodic_wave(&mut self, periodic_wave: &NapiPeriodicWave) {
        let periodic_wave = periodic_wave.inner.clone();
        self.inner.set_periodic_wave(periodic_wave);
    }
}
