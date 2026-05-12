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

#[napi(js_name = NapiAnalyserNode)]
pub struct NapiAnalyserNode {
    pub(crate) inner: AnalyserNode,
}

audio_node_impl!(NapiAnalyserNode);

#[napi]
impl NapiAnalyserNode {
    #[napi(constructor, catch_unwind)]
    pub fn new(
        context: Either<&NapiAudioContext, &NapiOfflineAudioContext>,
        options: Object,
    ) -> Self {
        // --------------------------------------------------------
        // Parse AnalyserOptions
        // by bindings construction all fields are populated on the JS side
        // --------------------------------------------------------

        let node_defaults: Option<AnalyserOptions> = Some(AnalyserOptions::default());

        let some_fft_size = options.get::<Option<u32>>("fftSize").unwrap();
        let fft_size = if let Some(fft_size) = some_fft_size.unwrap() {
            fft_size as usize
        } else if node_defaults.is_some() {
            node_defaults.clone().unwrap().fft_size
        } else {
            panic!("No default value for fft_size in AnalyserOptions")
        };

        let some_max_decibels = options.get::<Option<f64>>("maxDecibels").unwrap();
        let max_decibels = if let Some(max_decibels) = some_max_decibels.unwrap() {
            max_decibels
        } else if node_defaults.is_some() {
            node_defaults.clone().unwrap().max_decibels
        } else {
            panic!("No default value for max_decibels in AnalyserOptions")
        };

        let some_min_decibels = options.get::<Option<f64>>("minDecibels").unwrap();
        let min_decibels = if let Some(min_decibels) = some_min_decibels.unwrap() {
            min_decibels
        } else if node_defaults.is_some() {
            node_defaults.clone().unwrap().min_decibels
        } else {
            panic!("No default value for min_decibels in AnalyserOptions")
        };

        let some_smoothing_time_constant =
            options.get::<Option<f64>>("smoothingTimeConstant").unwrap();
        let smoothing_time_constant =
            if let Some(smoothing_time_constant) = some_smoothing_time_constant.unwrap() {
                smoothing_time_constant
            } else if node_defaults.is_some() {
                node_defaults.clone().unwrap().smoothing_time_constant
            } else {
                panic!("No default value for smoothing_time_constant in AnalyserOptions")
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
        // Create AnalyserOptions object
        // --------------------------------------------------------
        let options = AnalyserOptions {
            fft_size,
            max_decibels,
            min_decibels,
            smoothing_time_constant,
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
                AnalyserNode::new(native_context, options)
            }
            Either::B(context) => {
                let native_context = context.inner();
                AnalyserNode::new(native_context, options)
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

    #[napi(getter, js_name = "fftSize")]
    pub fn get_fft_size(&self) -> u32 {
        self.inner.fft_size() as u32
    }

    #[napi(setter, catch_unwind, js_name = "fftSize")]
    pub fn set_fft_size(&mut self, value: u32) {
        self.inner.set_fft_size(value as usize);
    }

    #[napi(getter, js_name = "frequencyBinCount")]
    pub fn get_frequency_bin_count(&self) -> u32 {
        self.inner.frequency_bin_count() as u32
    }

    #[napi(getter, js_name = "minDecibels")]
    pub fn get_min_decibels(&self) -> f64 {
        self.inner.min_decibels()
    }

    #[napi(setter, catch_unwind, js_name = "minDecibels")]
    pub fn set_min_decibels(&mut self, value: f64) {
        self.inner.set_min_decibels(value);
    }

    #[napi(getter, js_name = "maxDecibels")]
    pub fn get_max_decibels(&self) -> f64 {
        self.inner.max_decibels()
    }

    #[napi(setter, catch_unwind, js_name = "maxDecibels")]
    pub fn set_max_decibels(&mut self, value: f64) {
        self.inner.set_max_decibels(value);
    }

    #[napi(getter, js_name = "smoothingTimeConstant")]
    pub fn get_smoothing_time_constant(&self) -> f64 {
        self.inner.smoothing_time_constant()
    }

    #[napi(setter, catch_unwind, js_name = "smoothingTimeConstant")]
    pub fn set_smoothing_time_constant(&mut self, value: f64) {
        self.inner.set_smoothing_time_constant(value);
    }

    // -------------------------------------------------
    // METHODS
    // -------------------------------------------------

    #[napi(catch_unwind)]
    pub fn get_float_frequency_data(&mut self, mut array: Float32ArraySlice) {
        let array = unsafe { array.as_mut() };
        self.inner.get_float_frequency_data(array);
    }

    #[napi(catch_unwind)]
    pub fn get_byte_frequency_data(&mut self, mut array: Uint8ArraySlice) {
        let array = unsafe { array.as_mut() };
        self.inner.get_byte_frequency_data(array);
    }

    #[napi(catch_unwind)]
    pub fn get_float_time_domain_data(&mut self, mut array: Float32ArraySlice) {
        let array = unsafe { array.as_mut() };
        self.inner.get_float_time_domain_data(array);
    }

    #[napi(catch_unwind)]
    pub fn get_byte_time_domain_data(&mut self, mut array: Uint8ArraySlice) {
        let array = unsafe { array.as_mut() };
        self.inner.get_byte_time_domain_data(array);
    }
}
