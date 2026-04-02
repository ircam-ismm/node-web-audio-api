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

#[napi(js_name = NapiBiquadFilterNode)]
pub struct NapiBiquadFilterNode {
    pub(crate) inner: BiquadFilterNode,
    pub(crate) param_frequency: NapiAudioParam,
    pub(crate) param_detune: NapiAudioParam,
    pub(crate) param_q: NapiAudioParam,
    pub(crate) param_gain: NapiAudioParam,
}

audio_node_impl!(NapiBiquadFilterNode);

#[napi]
impl NapiBiquadFilterNode {
    // @todo - context: Either<&NapiAudioContext, &NapiOfflineAudioContext>
    #[napi(constructor)]
    pub fn new(
        context: Either<&NapiAudioContext, &NapiOfflineAudioContext>,
        options: Object,
    ) -> Self {
        // --------------------------------------------------------
        // Parse BiquadFilterOptions
        // by bindings construction all fields are populated on the JS side
        // --------------------------------------------------------

        let node_defaults: Option<BiquadFilterOptions> = Some(BiquadFilterOptions::default());

        let some_type_ = options.get::<Option<String>>("type").unwrap();
        let type_ = if let Some(type_) = some_type_.unwrap() {
            match type_.as_str() {
                "lowpass" => BiquadFilterType::Lowpass,
                "highpass" => BiquadFilterType::Highpass,
                "bandpass" => BiquadFilterType::Bandpass,
                "lowshelf" => BiquadFilterType::Lowshelf,
                "highshelf" => BiquadFilterType::Highshelf,
                "peaking" => BiquadFilterType::Peaking,
                "notch" => BiquadFilterType::Notch,
                "allpass" => BiquadFilterType::Allpass,
                _ => unreachable!(),
            }
        } else if node_defaults.is_some() {
            node_defaults.clone().unwrap().type_
        } else {
            panic!("No default value for type_ in BiquadFilterOptions")
        };

        let some_q = options.get::<Option<f64>>("Q").unwrap();
        let q = if let Some(q) = some_q.unwrap() {
            q as f32
        } else if node_defaults.is_some() {
            node_defaults.clone().unwrap().q
        } else {
            panic!("No default value for q in BiquadFilterOptions")
        };

        let some_detune = options.get::<Option<f64>>("detune").unwrap();
        let detune = if let Some(detune) = some_detune.unwrap() {
            detune as f32
        } else if node_defaults.is_some() {
            node_defaults.clone().unwrap().detune
        } else {
            panic!("No default value for detune in BiquadFilterOptions")
        };

        let some_frequency = options.get::<Option<f64>>("frequency").unwrap();
        let frequency = if let Some(frequency) = some_frequency.unwrap() {
            frequency as f32
        } else if node_defaults.is_some() {
            node_defaults.clone().unwrap().frequency
        } else {
            panic!("No default value for frequency in BiquadFilterOptions")
        };

        let some_gain = options.get::<Option<f64>>("gain").unwrap();
        let gain = if let Some(gain) = some_gain.unwrap() {
            gain as f32
        } else if node_defaults.is_some() {
            node_defaults.clone().unwrap().gain
        } else {
            panic!("No default value for gain in BiquadFilterOptions")
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
        // Create BiquadFilterOptions object
        // --------------------------------------------------------
        let options = BiquadFilterOptions {
            type_,
            q,
            detune,
            frequency,
            gain,
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
                BiquadFilterNode::new(native_context, options)
            }
            Either::B(context) => {
                let native_context = context.unwrap();
                BiquadFilterNode::new(native_context, options)
            }
        };

        // --------------------------------------------------------
        // Bind NapiAudioParam instances
        // --------------------------------------------------------

        let native_param = native_node.frequency().clone();
        let param_frequency = NapiAudioParam::new(native_param);

        let native_param = native_node.detune().clone();
        let param_detune = NapiAudioParam::new(native_param);

        let native_param = native_node.q().clone();
        let param_q = NapiAudioParam::new(native_param);

        let native_param = native_node.gain().clone();
        let param_gain = NapiAudioParam::new(native_param);

        Self {
            inner: native_node,
            param_frequency: param_frequency,
            param_detune: param_detune,
            param_q: param_q,
            param_gain: param_gain,
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

    #[napi(getter)]
    pub fn q(&self) -> NapiAudioParam {
        self.param_q.clone()
    }

    #[napi(getter)]
    pub fn gain(&self) -> NapiAudioParam {
        self.param_gain.clone()
    }

    // -------------------------------------------------
    // Getters / Setters
    // -------------------------------------------------

    #[napi(getter, js_name = "type")]
    pub fn get_type(&self) -> String {
        let value = self.inner.type_();
        let value = match value {
            BiquadFilterType::Lowpass => "lowpass",
            BiquadFilterType::Highpass => "highpass",
            BiquadFilterType::Bandpass => "bandpass",
            BiquadFilterType::Lowshelf => "lowshelf",
            BiquadFilterType::Highshelf => "highshelf",
            BiquadFilterType::Peaking => "peaking",
            BiquadFilterType::Notch => "notch",
            BiquadFilterType::Allpass => "allpass",
        };

        String::from(value)
    }

    #[napi(setter, js_name = "type")]
    pub fn set_type(&mut self, value: String) {
        let value = match value.as_str() {
            "lowpass" => BiquadFilterType::Lowpass,
            "highpass" => BiquadFilterType::Highpass,
            "bandpass" => BiquadFilterType::Bandpass,
            "lowshelf" => BiquadFilterType::Lowshelf,
            "highshelf" => BiquadFilterType::Highshelf,
            "peaking" => BiquadFilterType::Peaking,
            "notch" => BiquadFilterType::Notch,
            "allpass" => BiquadFilterType::Allpass,
            _ => unreachable!(),
        };

        self.inner.set_type(value);
    }

    // -------------------------------------------------
    // METHODS
    // -------------------------------------------------

    #[napi]
    pub fn get_frequency_response(
        &mut self,
        mut frequency_hz: Float32ArraySlice,
        mut mag_response: Float32ArraySlice,
        mut phase_response: Float32ArraySlice,
    ) {
        let frequency_hz = unsafe { frequency_hz.as_mut() };
        let mag_response = unsafe { mag_response.as_mut() };
        let phase_response = unsafe { phase_response.as_mut() };
        self.inner
            .get_frequency_response(frequency_hz, mag_response, phase_response);
    }
}
