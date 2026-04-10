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

#[napi(js_name = NapiStereoPannerNode)]
pub struct NapiStereoPannerNode {
    pub(crate) inner: StereoPannerNode,
    pub(crate) pan: NapiAudioParam,
}

audio_node_impl!(NapiStereoPannerNode);

#[napi]
impl NapiStereoPannerNode {
    #[napi(constructor, catch_unwind)]
    pub fn new(
        context: Either<&NapiAudioContext, &NapiOfflineAudioContext>,
        options: Object,
    ) -> Self {
        // --------------------------------------------------------
        // Parse StereoPannerOptions
        // by bindings construction all fields are populated on the JS side
        // --------------------------------------------------------

        let node_defaults: Option<StereoPannerOptions> = Some(StereoPannerOptions::default());

        let some_pan = options.get::<Option<f64>>("pan").unwrap();
        let pan = if let Some(pan) = some_pan.unwrap() {
            pan as f32
        } else if node_defaults.is_some() {
            node_defaults.clone().unwrap().pan
        } else {
            panic!("No default value for pan in StereoPannerOptions")
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
        // Create StereoPannerOptions object
        // --------------------------------------------------------
        let options = StereoPannerOptions {
            pan,
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
                StereoPannerNode::new(native_context, options)
            }
            Either::B(context) => {
                let native_context = context.unwrap();
                StereoPannerNode::new(native_context, options)
            }
        };

        // --------------------------------------------------------
        // Bind NapiAudioParam instances
        // --------------------------------------------------------

        let native_param = native_node.pan().clone();
        let pan = NapiAudioParam::new(native_param);

        Self {
            inner: native_node,
            pan,
        }
    }

    #[napi(getter)]
    pub fn pan(&self) -> NapiAudioParam {
        self.pan.clone()
    }
}
