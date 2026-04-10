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

#[napi(js_name = NapiPannerNode)]
pub struct NapiPannerNode {
    pub(crate) inner: PannerNode,
    pub(crate) position_x: NapiAudioParam,
    pub(crate) position_y: NapiAudioParam,
    pub(crate) position_z: NapiAudioParam,
    pub(crate) orientation_x: NapiAudioParam,
    pub(crate) orientation_y: NapiAudioParam,
    pub(crate) orientation_z: NapiAudioParam,
}

audio_node_impl!(NapiPannerNode);

#[napi]
impl NapiPannerNode {
    #[napi(constructor, catch_unwind)]
    pub fn new(
        context: Either<&NapiAudioContext, &NapiOfflineAudioContext>,
        options: Object,
    ) -> Self {
        // --------------------------------------------------------
        // Parse PannerOptions
        // by bindings construction all fields are populated on the JS side
        // --------------------------------------------------------

        let node_defaults: Option<PannerOptions> = Some(PannerOptions::default());

        let some_panning_model = options.get::<Option<String>>("panningModel").unwrap();
        let panning_model = if let Some(panning_model) = some_panning_model.unwrap() {
            match panning_model.as_str() {
                "equalpower" => PanningModelType::EqualPower,
                "HRTF" => PanningModelType::HRTF,
                _ => unreachable!(),
            }
        } else if node_defaults.is_some() {
            node_defaults.clone().unwrap().panning_model
        } else {
            panic!("No default value for panning_model in PannerOptions")
        };

        let some_distance_model = options.get::<Option<String>>("distanceModel").unwrap();
        let distance_model = if let Some(distance_model) = some_distance_model.unwrap() {
            match distance_model.as_str() {
                "linear" => DistanceModelType::Linear,
                "inverse" => DistanceModelType::Inverse,
                "exponential" => DistanceModelType::Exponential,
                _ => unreachable!(),
            }
        } else if node_defaults.is_some() {
            node_defaults.clone().unwrap().distance_model
        } else {
            panic!("No default value for distance_model in PannerOptions")
        };

        let some_position_x = options.get::<Option<f64>>("positionX").unwrap();
        let position_x = if let Some(position_x) = some_position_x.unwrap() {
            position_x as f32
        } else if node_defaults.is_some() {
            node_defaults.clone().unwrap().position_x
        } else {
            panic!("No default value for position_x in PannerOptions")
        };

        let some_position_y = options.get::<Option<f64>>("positionY").unwrap();
        let position_y = if let Some(position_y) = some_position_y.unwrap() {
            position_y as f32
        } else if node_defaults.is_some() {
            node_defaults.clone().unwrap().position_y
        } else {
            panic!("No default value for position_y in PannerOptions")
        };

        let some_position_z = options.get::<Option<f64>>("positionZ").unwrap();
        let position_z = if let Some(position_z) = some_position_z.unwrap() {
            position_z as f32
        } else if node_defaults.is_some() {
            node_defaults.clone().unwrap().position_z
        } else {
            panic!("No default value for position_z in PannerOptions")
        };

        let some_orientation_x = options.get::<Option<f64>>("orientationX").unwrap();
        let orientation_x = if let Some(orientation_x) = some_orientation_x.unwrap() {
            orientation_x as f32
        } else if node_defaults.is_some() {
            node_defaults.clone().unwrap().orientation_x
        } else {
            panic!("No default value for orientation_x in PannerOptions")
        };

        let some_orientation_y = options.get::<Option<f64>>("orientationY").unwrap();
        let orientation_y = if let Some(orientation_y) = some_orientation_y.unwrap() {
            orientation_y as f32
        } else if node_defaults.is_some() {
            node_defaults.clone().unwrap().orientation_y
        } else {
            panic!("No default value for orientation_y in PannerOptions")
        };

        let some_orientation_z = options.get::<Option<f64>>("orientationZ").unwrap();
        let orientation_z = if let Some(orientation_z) = some_orientation_z.unwrap() {
            orientation_z as f32
        } else if node_defaults.is_some() {
            node_defaults.clone().unwrap().orientation_z
        } else {
            panic!("No default value for orientation_z in PannerOptions")
        };

        let some_ref_distance = options.get::<Option<f64>>("refDistance").unwrap();
        let ref_distance = if let Some(ref_distance) = some_ref_distance.unwrap() {
            ref_distance
        } else if node_defaults.is_some() {
            node_defaults.clone().unwrap().ref_distance
        } else {
            panic!("No default value for ref_distance in PannerOptions")
        };

        let some_max_distance = options.get::<Option<f64>>("maxDistance").unwrap();
        let max_distance = if let Some(max_distance) = some_max_distance.unwrap() {
            max_distance
        } else if node_defaults.is_some() {
            node_defaults.clone().unwrap().max_distance
        } else {
            panic!("No default value for max_distance in PannerOptions")
        };

        let some_rolloff_factor = options.get::<Option<f64>>("rolloffFactor").unwrap();
        let rolloff_factor = if let Some(rolloff_factor) = some_rolloff_factor.unwrap() {
            rolloff_factor
        } else if node_defaults.is_some() {
            node_defaults.clone().unwrap().rolloff_factor
        } else {
            panic!("No default value for rolloff_factor in PannerOptions")
        };

        let some_cone_inner_angle = options.get::<Option<f64>>("coneInnerAngle").unwrap();
        let cone_inner_angle = if let Some(cone_inner_angle) = some_cone_inner_angle.unwrap() {
            cone_inner_angle
        } else if node_defaults.is_some() {
            node_defaults.clone().unwrap().cone_inner_angle
        } else {
            panic!("No default value for cone_inner_angle in PannerOptions")
        };

        let some_cone_outer_angle = options.get::<Option<f64>>("coneOuterAngle").unwrap();
        let cone_outer_angle = if let Some(cone_outer_angle) = some_cone_outer_angle.unwrap() {
            cone_outer_angle
        } else if node_defaults.is_some() {
            node_defaults.clone().unwrap().cone_outer_angle
        } else {
            panic!("No default value for cone_outer_angle in PannerOptions")
        };

        let some_cone_outer_gain = options.get::<Option<f64>>("coneOuterGain").unwrap();
        let cone_outer_gain = if let Some(cone_outer_gain) = some_cone_outer_gain.unwrap() {
            cone_outer_gain
        } else if node_defaults.is_some() {
            node_defaults.clone().unwrap().cone_outer_gain
        } else {
            panic!("No default value for cone_outer_gain in PannerOptions")
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
        // Create PannerOptions object
        // --------------------------------------------------------
        let options = PannerOptions {
            panning_model,
            distance_model,
            position_x,
            position_y,
            position_z,
            orientation_x,
            orientation_y,
            orientation_z,
            ref_distance,
            max_distance,
            rolloff_factor,
            cone_inner_angle,
            cone_outer_angle,
            cone_outer_gain,
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
                PannerNode::new(native_context, options)
            }
            Either::B(context) => {
                let native_context = context.unwrap();
                PannerNode::new(native_context, options)
            }
        };

        // --------------------------------------------------------
        // Bind NapiAudioParam instances
        // --------------------------------------------------------

        let native_param = native_node.position_x().clone();
        let position_x = NapiAudioParam::new(native_param);

        let native_param = native_node.position_y().clone();
        let position_y = NapiAudioParam::new(native_param);

        let native_param = native_node.position_z().clone();
        let position_z = NapiAudioParam::new(native_param);

        let native_param = native_node.orientation_x().clone();
        let orientation_x = NapiAudioParam::new(native_param);

        let native_param = native_node.orientation_y().clone();
        let orientation_y = NapiAudioParam::new(native_param);

        let native_param = native_node.orientation_z().clone();
        let orientation_z = NapiAudioParam::new(native_param);

        Self {
            inner: native_node,
            position_x,
            position_y,
            position_z,
            orientation_x,
            orientation_y,
            orientation_z,
        }
    }

    #[napi(getter)]
    pub fn position_x(&self) -> NapiAudioParam {
        self.position_x.clone()
    }

    #[napi(getter)]
    pub fn position_y(&self) -> NapiAudioParam {
        self.position_y.clone()
    }

    #[napi(getter)]
    pub fn position_z(&self) -> NapiAudioParam {
        self.position_z.clone()
    }

    #[napi(getter)]
    pub fn orientation_x(&self) -> NapiAudioParam {
        self.orientation_x.clone()
    }

    #[napi(getter)]
    pub fn orientation_y(&self) -> NapiAudioParam {
        self.orientation_y.clone()
    }

    #[napi(getter)]
    pub fn orientation_z(&self) -> NapiAudioParam {
        self.orientation_z.clone()
    }

    // -------------------------------------------------
    // Getters / Setters
    // -------------------------------------------------

    #[napi(getter, js_name = "panningModel")]
    pub fn get_panning_model(&self) -> String {
        let value = self.inner.panning_model();
        let value = match value {
            PanningModelType::EqualPower => "equalpower",
            PanningModelType::HRTF => "HRTF",
        };

        String::from(value)
    }

    #[napi(setter, catch_unwind, js_name = "panningModel")]
    pub fn set_panning_model(&mut self, value: String) {
        let value = match value.as_str() {
            "equalpower" => PanningModelType::EqualPower,
            "HRTF" => PanningModelType::HRTF,
            _ => unreachable!(),
        };

        self.inner.set_panning_model(value);
    }

    #[napi(getter, js_name = "distanceModel")]
    pub fn get_distance_model(&self) -> String {
        let value = self.inner.distance_model();
        let value = match value {
            DistanceModelType::Linear => "linear",
            DistanceModelType::Inverse => "inverse",
            DistanceModelType::Exponential => "exponential",
        };

        String::from(value)
    }

    #[napi(setter, catch_unwind, js_name = "distanceModel")]
    pub fn set_distance_model(&mut self, value: String) {
        let value = match value.as_str() {
            "linear" => DistanceModelType::Linear,
            "inverse" => DistanceModelType::Inverse,
            "exponential" => DistanceModelType::Exponential,
            _ => unreachable!(),
        };

        self.inner.set_distance_model(value);
    }

    #[napi(getter, js_name = "refDistance")]
    pub fn get_ref_distance(&self) -> f64 {
        self.inner.ref_distance()
    }

    #[napi(setter, catch_unwind, js_name = "refDistance")]
    pub fn set_ref_distance(&mut self, value: f64) {
        self.inner.set_ref_distance(value);
    }

    #[napi(getter, js_name = "maxDistance")]
    pub fn get_max_distance(&self) -> f64 {
        self.inner.max_distance()
    }

    #[napi(setter, catch_unwind, js_name = "maxDistance")]
    pub fn set_max_distance(&mut self, value: f64) {
        self.inner.set_max_distance(value);
    }

    #[napi(getter, js_name = "rolloffFactor")]
    pub fn get_rolloff_factor(&self) -> f64 {
        self.inner.rolloff_factor()
    }

    #[napi(setter, catch_unwind, js_name = "rolloffFactor")]
    pub fn set_rolloff_factor(&mut self, value: f64) {
        self.inner.set_rolloff_factor(value);
    }

    #[napi(getter, js_name = "coneInnerAngle")]
    pub fn get_cone_inner_angle(&self) -> f64 {
        self.inner.cone_inner_angle()
    }

    #[napi(setter, catch_unwind, js_name = "coneInnerAngle")]
    pub fn set_cone_inner_angle(&mut self, value: f64) {
        self.inner.set_cone_inner_angle(value);
    }

    #[napi(getter, js_name = "coneOuterAngle")]
    pub fn get_cone_outer_angle(&self) -> f64 {
        self.inner.cone_outer_angle()
    }

    #[napi(setter, catch_unwind, js_name = "coneOuterAngle")]
    pub fn set_cone_outer_angle(&mut self, value: f64) {
        self.inner.set_cone_outer_angle(value);
    }

    #[napi(getter, js_name = "coneOuterGain")]
    pub fn get_cone_outer_gain(&self) -> f64 {
        self.inner.cone_outer_gain()
    }

    #[napi(setter, catch_unwind, js_name = "coneOuterGain")]
    pub fn set_cone_outer_gain(&mut self, value: f64) {
        self.inner.set_cone_outer_gain(value);
    }

    // -------------------------------------------------
    // METHODS
    // -------------------------------------------------

    #[napi(catch_unwind)]
    pub fn set_position(&mut self, x: f64, y: f64, z: f64) {
        let x = x as f32;
        let y = y as f32;
        let z = z as f32;
        self.inner.set_position(x, y, z);
    }

    #[napi(catch_unwind)]
    pub fn set_orientation(&mut self, x: f64, y: f64, z: f64) {
        let x = x as f32;
        let y = y as f32;
        let z = z as f32;
        self.inner.set_orientation(x, y, z);
    }
}
