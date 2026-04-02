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

#[napi(js_name = NapiWaveShaperNode)]
pub struct NapiWaveShaperNode {
    pub(crate) inner: WaveShaperNode,
}

audio_node_impl!(NapiWaveShaperNode);

#[napi]
impl NapiWaveShaperNode {
    // @todo - context: Either<&NapiAudioContext, &NapiOfflineAudioContext>
    #[napi(constructor)]
    pub fn new(
        context: Either<&NapiAudioContext, &NapiOfflineAudioContext>,
        options: Object,
    ) -> Self {
        // --------------------------------------------------------
        // Parse WaveShaperOptions
        // by bindings construction all fields are populated on the JS side
        // --------------------------------------------------------

        let node_defaults: Option<WaveShaperOptions> = Some(WaveShaperOptions::default());

        let some_curve = options.get::<Option<&[f32]>>("curve").unwrap();
        let curve = if let Some(curve) = some_curve.unwrap() {
            Some(curve.to_vec())
        } else if node_defaults.is_some() {
            node_defaults.clone().unwrap().curve
        } else {
            panic!("No default value for curve in WaveShaperOptions")
        };

        let some_oversample = options.get::<Option<String>>("oversample").unwrap();
        let oversample = if let Some(oversample) = some_oversample.unwrap() {
            match oversample.as_str() {
                "none" => OverSampleType::None,
                "2x" => OverSampleType::X2,
                "4x" => OverSampleType::X4,
                _ => unreachable!(),
            }
        } else if node_defaults.is_some() {
            node_defaults.clone().unwrap().oversample
        } else {
            panic!("No default value for oversample in WaveShaperOptions")
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
        // Create WaveShaperOptions object
        // --------------------------------------------------------
        let options = WaveShaperOptions {
            curve,
            oversample,
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
                WaveShaperNode::new(native_context, options)
            }
            Either::B(context) => {
                let native_context = context.unwrap();
                WaveShaperNode::new(native_context, options)
            }
        };

        // --------------------------------------------------------
        // Bind NapiAudioParam instances
        // --------------------------------------------------------

        Self { inner: native_node }
    }

    // -------------------------------------------------
    // Getters / Setters
    // -------------------------------------------------

    #[napi(getter, js_name = "curve")]
    pub fn get_curve(&self) -> Either<Float32Array, Null> {
        let value = self.inner.curve();

        match value {
            Some(value) => Either::A(Float32Array::new(value.to_vec())),
            None => Either::B(Null),
        }
    }

    #[napi(setter, js_name = "curve")]
    pub fn set_curve(&mut self, value: &[f32]) {
        self.inner.set_curve(value.to_vec());
    }

    #[napi(getter, js_name = "oversample")]
    pub fn get_oversample(&self) -> String {
        let value = self.inner.oversample();
        let value = match value {
            OverSampleType::None => "none",
            OverSampleType::X2 => "2x",
            OverSampleType::X4 => "4x",
        };

        String::from(value)
    }

    #[napi(setter, js_name = "oversample")]
    pub fn set_oversample(&mut self, value: String) {
        let value = match value.as_str() {
            "none" => OverSampleType::None,
            "2x" => OverSampleType::X2,
            "4x" => OverSampleType::X4,
            _ => unreachable!(),
        };

        self.inner.set_oversample(value);
    }
}
