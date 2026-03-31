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

#[napi]
pub struct NapiAudioBufferSourceNode {
    pub(crate) inner: AudioBufferSourceNode,
}

audio_node_impl!(NapiAudioBufferSourceNode);

#[napi]
impl NapiAudioBufferSourceNode {
    // @todo - context: Either<&NapiAudioContext, &NapiOfflineAudioContext>
    #[napi(constructor)]
    pub fn new(
        mut this: This<Object>,
        context: Either<&NapiAudioContext, &NapiOfflineAudioContext>,
        options: Object,
    ) -> Self {
        // @todo - finish options handling

        // --------------------------------------------------------
        // Parse AudioBufferSourceOptions
        // by bindings construction all fields are populated on the JS side
        // --------------------------------------------------------
        let node_defaults = AudioBufferSourceOptions::default();

        let js_buffer = options
            .get::<Option<ClassInstance<&NapiAudioBuffer>>>("buffer")
            .unwrap();
        let buffer = if let Some(buffer) = js_buffer.unwrap() {
            Some(buffer.inner.clone())
        } else {
            None
        };

        let some_detune = options.get::<Option<f64>>("detune").unwrap();
        let detune = if let Some(detune) = some_detune.unwrap() {
            detune as f32
        } else {
            node_defaults.detune
        };

        let some_loop_ = options.get::<Option<bool>>("loop").unwrap();
        let loop_ = if let Some(loop_) = some_loop_.unwrap() {
            loop_
        } else {
            node_defaults.loop_
        };

        let some_loop_end = options.get::<Option<f64>>("loopEnd").unwrap();
        let loop_end = if let Some(loop_end) = some_loop_end.unwrap() {
            loop_end
        } else {
            node_defaults.loop_end
        };

        let some_loop_start = options.get::<Option<f64>>("loopStart").unwrap();
        let loop_start = if let Some(loop_start) = some_loop_start.unwrap() {
            loop_start
        } else {
            node_defaults.loop_start
        };

        let some_playback_rate = options.get::<Option<f64>>("playbackRate").unwrap();
        let playback_rate = if let Some(playback_rate) = some_playback_rate.unwrap() {
            playback_rate as f32
        } else {
            node_defaults.playback_rate
        };

        // --------------------------------------------------------
        // Create AudioBufferSourceOptions object
        // --------------------------------------------------------
        let options = AudioBufferSourceOptions {
            buffer,
            detune,
            loop_,
            loop_end,
            loop_start,
            playback_rate,
        };

        // --------------------------------------------------------
        // Create native instance
        // --------------------------------------------------------
        let native_node = match context {
            Either::A(context) => {
                let native_context = context.unwrap();
                AudioBufferSourceNode::new(native_context, options)
            }
            Either::B(context) => {
                let native_context = context.unwrap();
                AudioBufferSourceNode::new(native_context, options)
            }
        };

        // --------------------------------------------------------
        // Create and bind NapiAudioParam instances
        // --------------------------------------------------------

        let native_param = native_node.playback_rate().clone();
        let napi_param = NapiAudioParam::new(native_param);
        let _ = this.set_named_property("playbackRate", napi_param);

        let native_param = native_node.detune().clone();
        let napi_param = NapiAudioParam::new(native_param);
        let _ = this.set_named_property("detune", napi_param);

        // create js instance
        Self { inner: native_node }
    }

    #[napi]
    pub fn start(&mut self, when: Option<f64>, offset: Option<f64>, duration: Option<f64>) {
        let when = when.unwrap_or(0.);
        let offset = offset.unwrap_or(0.);

        if !duration.is_some() {
            self.inner.start_at_with_offset(when, offset);
        } else {
            self.inner
                .start_at_with_offset_and_duration(when, offset, duration.unwrap());
        }
    }

    #[napi]
    pub fn stop(&mut self, when: Option<f64>) {
        let when = when.unwrap_or(0.);
        self.inner.stop_at(when);
    }

    // -------------------------------------------------
    // Getters / Setters
    // -------------------------------------------------

    #[napi(getter, js_name = "buffer")]
    pub fn get_buffer(&self) {
        unreachable!();
    }

    #[napi(setter, js_name = "buffer")]
    pub fn set_buffer(&mut self, value: &NapiAudioBuffer) {
        self.inner.set_buffer(value.inner.clone());
    }

    #[napi(getter, js_name = "loop")]
    pub fn get_loop(&self) -> bool {
        self.inner.loop_()
    }

    #[napi(setter, js_name = "loop")]
    pub fn set_loop(&mut self, value: bool) {
        self.inner.set_loop(value);
    }

    #[napi(getter, js_name = "loopStart")]
    pub fn get_loop_start(&self) -> f64 {
        self.inner.loop_start()
    }

    #[napi(setter, js_name = "loopStart")]
    pub fn set_loop_start(&mut self, value: f64) {
        self.inner.set_loop_start(value);
    }

    #[napi(getter, js_name = "loopEnd")]
    pub fn get_loop_end(&self) -> f64 {
        self.inner.loop_end()
    }

    #[napi(setter, js_name = "loopEnd")]
    pub fn set_loop_end(&mut self, value: f64) {
        self.inner.set_loop_end(value);
    }
}
