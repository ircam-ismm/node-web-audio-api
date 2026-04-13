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

#[napi(js_name = NapiAudioBufferSourceNode)]
pub struct NapiAudioBufferSourceNode {
    pub(crate) inner: AudioBufferSourceNode,
    pub(crate) playback_rate: NapiAudioParam,
    pub(crate) detune: NapiAudioParam,
}

audio_node_impl!(NapiAudioBufferSourceNode);

#[napi]
impl NapiAudioBufferSourceNode {
    #[napi(constructor, catch_unwind)]
    pub fn new(
        context: Either<&NapiAudioContext, &NapiOfflineAudioContext>,
        options: Object,
    ) -> Self {
        // --------------------------------------------------------
        // Parse AudioBufferSourceOptions
        // by bindings construction all fields are populated on the JS side
        // --------------------------------------------------------

        let node_defaults: Option<AudioBufferSourceOptions> =
            Some(AudioBufferSourceOptions::default());

        let js_buffer = options
            .get::<Option<ClassInstance<NapiAudioBuffer>>>("buffer")
            .unwrap();
        let buffer = js_buffer.unwrap().map(|js_buffer| js_buffer.inner.clone());

        let some_detune = options.get::<Option<f64>>("detune").unwrap();
        let detune = if let Some(detune) = some_detune.unwrap() {
            detune as f32
        } else if node_defaults.is_some() {
            node_defaults.clone().unwrap().detune
        } else {
            panic!("No default value for detune in AudioBufferSourceOptions")
        };

        let some_loop_ = options.get::<Option<bool>>("loop").unwrap();
        let loop_ = if let Some(loop_) = some_loop_.unwrap() {
            loop_
        } else if node_defaults.is_some() {
            node_defaults.clone().unwrap().loop_
        } else {
            panic!("No default value for loop_ in AudioBufferSourceOptions")
        };

        let some_loop_end = options.get::<Option<f64>>("loopEnd").unwrap();
        let loop_end = if let Some(loop_end) = some_loop_end.unwrap() {
            loop_end
        } else if node_defaults.is_some() {
            node_defaults.clone().unwrap().loop_end
        } else {
            panic!("No default value for loop_end in AudioBufferSourceOptions")
        };

        let some_loop_start = options.get::<Option<f64>>("loopStart").unwrap();
        let loop_start = if let Some(loop_start) = some_loop_start.unwrap() {
            loop_start
        } else if node_defaults.is_some() {
            node_defaults.clone().unwrap().loop_start
        } else {
            panic!("No default value for loop_start in AudioBufferSourceOptions")
        };

        let some_playback_rate = options.get::<Option<f64>>("playbackRate").unwrap();
        let playback_rate = if let Some(playback_rate) = some_playback_rate.unwrap() {
            playback_rate as f32
        } else if node_defaults.is_some() {
            node_defaults.clone().unwrap().playback_rate
        } else {
            panic!("No default value for playback_rate in AudioBufferSourceOptions")
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
        // Bind NapiAudioParam instances
        // --------------------------------------------------------

        let native_param = native_node.playback_rate().clone();
        let playback_rate = NapiAudioParam::new(native_param);

        let native_param = native_node.detune().clone();
        let detune = NapiAudioParam::new(native_param);

        Self {
            inner: native_node,
            playback_rate,
            detune,
        }
    }

    #[napi(getter, js_name = "playbackRate")]
    pub fn playback_rate(&self) -> NapiAudioParam {
        self.playback_rate.clone()
    }

    #[napi(getter, js_name = "detune")]
    pub fn detune(&self) -> NapiAudioParam {
        self.detune.clone()
    }

    #[napi(catch_unwind)]
    pub fn start(&mut self, when: Option<f64>, offset: Option<f64>, duration: Option<f64>) {
        let when = when.unwrap_or(0.);
        let offset = offset.unwrap_or(0.);

        match duration {
            Some(duration) => self
                .inner
                .start_at_with_offset_and_duration(when, offset, duration),
            None => self.inner.start_at_with_offset(when, offset),
        }
    }

    #[napi(catch_unwind)]
    pub fn stop(&mut self, when: Option<f64>) {
        let when = when.unwrap_or(0.);
        self.inner.stop_at(when);
    }

    #[napi]
    pub fn onended(&self, callback: Function<NapiEvent, ()>) -> Result<()> {
        let tsfn = callback
            .build_threadsafe_function()
            .weak::<true>() // do not prevent process to exit
            .build_callback(
                move |ctx: napi::threadsafe_function::ThreadsafeCallContext<
                    web_audio_api::Event,
                >| {
                    Ok(NapiEvent {
                        type_: ctx.value.type_.to_string(),
                    })
                },
            )?;

        self.inner.set_onended(move |e| {
            tsfn.call(
                e,
                napi::threadsafe_function::ThreadsafeFunctionCallMode::Blocking,
            );
        });

        Ok(())
    }

    // -------------------------------------------------
    // Getters / Setters
    // -------------------------------------------------

    #[napi(getter, js_name = "buffer")]
    pub fn get_buffer(&self) {
        unreachable!();
    }

    #[napi(setter, catch_unwind, js_name = "buffer")]
    pub fn set_buffer(&mut self, value: &NapiAudioBuffer) {
        self.inner.set_buffer(value.inner.clone());
    }

    #[napi(getter, js_name = "loop")]
    pub fn get_loop(&self) -> bool {
        self.inner.loop_()
    }

    #[napi(setter, catch_unwind, js_name = "loop")]
    pub fn set_loop(&mut self, value: bool) {
        self.inner.set_loop(value);
    }

    #[napi(getter, js_name = "loopStart")]
    pub fn get_loop_start(&self) -> f64 {
        self.inner.loop_start()
    }

    #[napi(setter, catch_unwind, js_name = "loopStart")]
    pub fn set_loop_start(&mut self, value: f64) {
        self.inner.set_loop_start(value);
    }

    #[napi(getter, js_name = "loopEnd")]
    pub fn get_loop_end(&self) -> f64 {
        self.inner.loop_end()
    }

    #[napi(setter, catch_unwind, js_name = "loopEnd")]
    pub fn set_loop_end(&mut self, value: f64) {
        self.inner.set_loop_end(value);
    }
}
