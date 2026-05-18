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

#[napi(js_name = NapiDynamicsCompressorNode)]
pub struct NapiDynamicsCompressorNode {
    pub(crate) inner: DynamicsCompressorNode,
    pub(crate) threshold: NapiAudioParam,
    pub(crate) knee: NapiAudioParam,
    pub(crate) ratio: NapiAudioParam,
    pub(crate) attack: NapiAudioParam,
    pub(crate) release: NapiAudioParam,
}

audio_node_impl!(NapiDynamicsCompressorNode);

#[napi]
impl NapiDynamicsCompressorNode {
    #[napi(constructor, catch_unwind)]
    pub fn new(
        context: Either<&NapiAudioContext, &NapiOfflineAudioContext>,
        options: Object,
    ) -> Self {
        // --------------------------------------------------------
        // Parse DynamicsCompressorOptions
        // by bindings construction all fields are populated on the JS side
        // --------------------------------------------------------

        let node_defaults: Option<DynamicsCompressorOptions> =
            Some(DynamicsCompressorOptions::default());

        let some_attack = options.get::<Option<f64>>("attack").unwrap();
        let attack = if let Some(attack) = some_attack.unwrap() {
            attack as f32
        } else if node_defaults.is_some() {
            node_defaults.clone().unwrap().attack
        } else {
            panic!("No default value for attack in DynamicsCompressorOptions")
        };

        let some_knee = options.get::<Option<f64>>("knee").unwrap();
        let knee = if let Some(knee) = some_knee.unwrap() {
            knee as f32
        } else if node_defaults.is_some() {
            node_defaults.clone().unwrap().knee
        } else {
            panic!("No default value for knee in DynamicsCompressorOptions")
        };

        let some_ratio = options.get::<Option<f64>>("ratio").unwrap();
        let ratio = if let Some(ratio) = some_ratio.unwrap() {
            ratio as f32
        } else if node_defaults.is_some() {
            node_defaults.clone().unwrap().ratio
        } else {
            panic!("No default value for ratio in DynamicsCompressorOptions")
        };

        let some_release = options.get::<Option<f64>>("release").unwrap();
        let release = if let Some(release) = some_release.unwrap() {
            release as f32
        } else if node_defaults.is_some() {
            node_defaults.clone().unwrap().release
        } else {
            panic!("No default value for release in DynamicsCompressorOptions")
        };

        let some_threshold = options.get::<Option<f64>>("threshold").unwrap();
        let threshold = if let Some(threshold) = some_threshold.unwrap() {
            threshold as f32
        } else if node_defaults.is_some() {
            node_defaults.clone().unwrap().threshold
        } else {
            panic!("No default value for threshold in DynamicsCompressorOptions")
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
        // Create DynamicsCompressorOptions object
        // --------------------------------------------------------
        let options = DynamicsCompressorOptions {
            attack,
            knee,
            ratio,
            release,
            threshold,
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
                let native_context = context.inner();
                DynamicsCompressorNode::new(native_context, options)
            }
            Either::B(context) => {
                let native_context = context.inner();
                DynamicsCompressorNode::new(native_context, options)
            }
        };

        // --------------------------------------------------------
        // Bind NapiAudioParam instances
        // --------------------------------------------------------

        let native_param = native_node.threshold().clone();
        let threshold = NapiAudioParam::new(native_param);

        let native_param = native_node.knee().clone();
        let knee = NapiAudioParam::new(native_param);

        let native_param = native_node.ratio().clone();
        let ratio = NapiAudioParam::new(native_param);

        let native_param = native_node.attack().clone();
        let attack = NapiAudioParam::new(native_param);

        let native_param = native_node.release().clone();
        let release = NapiAudioParam::new(native_param);

        Self {
            inner: native_node,
            threshold,
            knee,
            ratio,
            attack,
            release,
        }
    }

    #[napi(getter, js_name = "threshold")]
    pub fn threshold(&self) -> NapiAudioParam {
        self.threshold.clone()
    }

    #[napi(getter, js_name = "knee")]
    pub fn knee(&self) -> NapiAudioParam {
        self.knee.clone()
    }

    #[napi(getter, js_name = "ratio")]
    pub fn ratio(&self) -> NapiAudioParam {
        self.ratio.clone()
    }

    #[napi(getter, js_name = "attack")]
    pub fn attack(&self) -> NapiAudioParam {
        self.attack.clone()
    }

    #[napi(getter, js_name = "release")]
    pub fn release(&self) -> NapiAudioParam {
        self.release.clone()
    }

    // -------------------------------------------------
    // Getters / Setters
    // -------------------------------------------------

    #[napi(getter, js_name = "reduction")]
    pub fn get_reduction(&self) -> f32 {
        self.inner.reduction()
    }
}
