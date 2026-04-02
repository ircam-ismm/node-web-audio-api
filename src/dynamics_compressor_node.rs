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
    pub(crate) param_threshold: NapiAudioParam,
    pub(crate) param_knee: NapiAudioParam,
    pub(crate) param_ratio: NapiAudioParam,
    pub(crate) param_attack: NapiAudioParam,
    pub(crate) param_release: NapiAudioParam,
}

audio_node_impl!(NapiDynamicsCompressorNode);

#[napi]
impl NapiDynamicsCompressorNode {
    // @todo - context: Either<&NapiAudioContext, &NapiOfflineAudioContext>
    #[napi(constructor)]
    pub fn new(
        context: Either<&NapiAudioContext, &NapiOfflineAudioContext>,
        options: Object,
    ) -> Self {
        // @todo - finish options handling

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
                let native_context = context.unwrap();
                DynamicsCompressorNode::new(native_context, options)
            }
            Either::B(context) => {
                let native_context = context.unwrap();
                DynamicsCompressorNode::new(native_context, options)
            }
        };

        // --------------------------------------------------------
        // Create and bind NapiAudioParam instances
        // --------------------------------------------------------

        let native_param = native_node.threshold().clone();
        let param_threshold = NapiAudioParam::new(native_param);

        let native_param = native_node.knee().clone();
        let param_knee = NapiAudioParam::new(native_param);

        let native_param = native_node.ratio().clone();
        let param_ratio = NapiAudioParam::new(native_param);

        let native_param = native_node.attack().clone();
        let param_attack = NapiAudioParam::new(native_param);

        let native_param = native_node.release().clone();
        let param_release = NapiAudioParam::new(native_param);

        // create js instance
        Self {
            inner: native_node,
            param_threshold: param_threshold,
            param_knee: param_knee,
            param_ratio: param_ratio,
            param_attack: param_attack,
            param_release: param_release,
        }
    }

    #[napi(getter)]
    pub fn threshold(&self) -> NapiAudioParam {
        self.param_threshold.clone()
    }

    #[napi(getter)]
    pub fn knee(&self) -> NapiAudioParam {
        self.param_knee.clone()
    }

    #[napi(getter)]
    pub fn ratio(&self) -> NapiAudioParam {
        self.param_ratio.clone()
    }

    #[napi(getter)]
    pub fn attack(&self) -> NapiAudioParam {
        self.param_attack.clone()
    }

    #[napi(getter)]
    pub fn release(&self) -> NapiAudioParam {
        self.param_release.clone()
    }

    // -------------------------------------------------
    // Getters / Setters
    // -------------------------------------------------

    #[napi(getter, js_name = "reduction")]
    pub fn get_reduction(&self) -> f64 {
        self.inner.reduction() as f64
    }
}
