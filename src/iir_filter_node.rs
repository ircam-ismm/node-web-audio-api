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

#[napi(js_name = NapiIIRFilterNode)]
pub struct NapiIIRFilterNode {
    pub(crate) inner: IIRFilterNode,
}

audio_node_impl!(NapiIIRFilterNode);

#[napi]
impl NapiIIRFilterNode {
    #[napi(constructor, catch_unwind)]
    pub fn new(
        context: Either<&NapiAudioContext, &NapiOfflineAudioContext>,
        options: Object,
    ) -> Self {
        // --------------------------------------------------------
        // Parse IIRFilterOptions
        // by bindings construction all fields are populated on the JS side
        // --------------------------------------------------------

        #[allow(unused)]
        let node_defaults: Option<IIRFilterOptions> = None;

        let some_feedforward = options.get::<Option<&[f64]>>("feedforward").unwrap();
        let feedforward = if let Some(feedforward) = some_feedforward.unwrap() {
            feedforward.to_vec()
        } else if node_defaults.is_some() {
            node_defaults.clone().unwrap().feedforward
        } else {
            panic!("No default value for feedforward in IIRFilterOptions")
        };

        let some_feedback = options.get::<Option<&[f64]>>("feedback").unwrap();
        let feedback = if let Some(feedback) = some_feedback.unwrap() {
            feedback.to_vec()
        } else if node_defaults.is_some() {
            node_defaults.clone().unwrap().feedback
        } else {
            panic!("No default value for feedback in IIRFilterOptions")
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
        // Create IIRFilterOptions object
        // --------------------------------------------------------
        let options = IIRFilterOptions {
            feedforward,
            feedback,
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
                IIRFilterNode::new(native_context, options)
            }
            Either::B(context) => {
                let native_context = context.inner();
                IIRFilterNode::new(native_context, options)
            }
        };

        // --------------------------------------------------------
        // Bind NapiAudioParam instances
        // --------------------------------------------------------

        Self { inner: native_node }
    }

    // -------------------------------------------------
    // METHODS
    // -------------------------------------------------

    #[napi(catch_unwind)]
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
