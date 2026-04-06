use std::sync::Arc;

use napi_derive::napi;
use web_audio_api::*;

use crate::NapiAudioParam;

#[derive(Clone)]
#[napi]
pub struct NapiAudioListener {
    pub(crate) inner: Arc<AudioListener>,
    pub(crate) position_x: NapiAudioParam,
    pub(crate) position_y: NapiAudioParam,
    pub(crate) position_z: NapiAudioParam,
    pub(crate) forward_x: NapiAudioParam,
    pub(crate) forward_y: NapiAudioParam,
    pub(crate) forward_z: NapiAudioParam,
    pub(crate) up_x: NapiAudioParam,
    pub(crate) up_y: NapiAudioParam,
    pub(crate) up_z: NapiAudioParam,
}

impl NapiAudioListener {
    pub(crate) fn new(native_listener: AudioListener) -> Self {
        let native_param = native_listener.position_x().clone();
        let position_x = NapiAudioParam::new(native_param);

        let native_param = native_listener.position_y().clone();
        let position_y = NapiAudioParam::new(native_param);

        let native_param = native_listener.position_z().clone();
        let position_z = NapiAudioParam::new(native_param);

        let native_param = native_listener.forward_x().clone();
        let forward_x = NapiAudioParam::new(native_param);

        let native_param = native_listener.forward_y().clone();
        let forward_y = NapiAudioParam::new(native_param);

        let native_param = native_listener.forward_z().clone();
        let forward_z = NapiAudioParam::new(native_param);

        let native_param = native_listener.up_x().clone();
        let up_x = NapiAudioParam::new(native_param);

        let native_param = native_listener.up_y().clone();
        let up_y = NapiAudioParam::new(native_param);

        let native_param = native_listener.up_z().clone();
        let up_z = NapiAudioParam::new(native_param);

        Self {
            inner: Arc::new(native_listener),
            position_x: position_x,
            position_y: position_y,
            position_z: position_z,
            forward_x: forward_x,
            forward_y: forward_y,
            forward_z: forward_z,
            up_x: up_x,
            up_y: up_y,
            up_z: up_z,
        }
    }
}

#[napi]
impl NapiAudioListener {
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
    pub fn forward_x(&self) -> NapiAudioParam {
        self.forward_x.clone()
    }

    #[napi(getter)]
    pub fn forward_y(&self) -> NapiAudioParam {
        self.forward_y.clone()
    }

    #[napi(getter)]
    pub fn forward_z(&self) -> NapiAudioParam {
        self.forward_z.clone()
    }

    #[napi(getter)]
    pub fn up_x(&self) -> NapiAudioParam {
        self.up_x.clone()
    }

    #[napi(getter)]
    pub fn up_y(&self) -> NapiAudioParam {
        self.up_y.clone()
    }

    #[napi(getter)]
    pub fn up_z(&self) -> NapiAudioParam {
        self.up_z.clone()
    }

    #[napi(catch_unwind)]
    pub fn set_position(&self, x: f64, y: f64, z: f64) {
        // TODO https://webaudio.github.io/web-audio-api/#dom-audiolistener-setposition
        //
        // When any of the positionX, positionY, and positionZ AudioParams for this AudioListener have
        // an automation curve set using setValueCurveAtTime() at the time this method is called, a
        // NotSupportedError MUST be thrown.
        self.inner.position_x().set_value(x as f32);
        self.inner.position_y().set_value(y as f32);
        self.inner.position_z().set_value(z as f32);
    }

    #[napi(catch_unwind)]
    pub fn set_orientation(
        &self,
        x_forward: f64,
        y_forward: f64,
        z_forward: f64,
        x_up: f64,
        y_up: f64,
        z_up: f64,
    ) {
        // TODO https://webaudio.github.io/web-audio-api/#dom-audiolistener-setorientation
        //
        // If any of the forwardX, forwardY, forwardZ, upX, upY and upZ AudioParams have an automation
        // curve set using setValueCurveAtTime() at the time this method is called, a NotSupportedError
        // MUST be thrown.
        self.inner.forward_x().set_value(x_forward as f32);
        self.inner.forward_y().set_value(y_forward as f32);
        self.inner.forward_z().set_value(z_forward as f32);
        self.inner.up_x().set_value(x_up as f32);
        self.inner.up_y().set_value(y_up as f32);
        self.inner.up_z().set_value(z_up as f32);
    }
}
