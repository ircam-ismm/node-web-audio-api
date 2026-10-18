use std::sync::Arc;

use napi::bindgen_prelude::*;
use napi_derive::napi;

use web_audio_api::context::{
    AudioContext, AudioContextLatencyCategory, AudioContextOptions, BaseAudioContext,
};

use crate::NapiAudioDestinationNode;
use crate::NapiAudioListener;
use crate::NapiAudioPlaybackStats;
use crate::NapiAudioRenderCapacity;
use crate::NapiEvent;

pub struct SetSinkIdTask {
    context: Arc<AudioContext>,
    sink_id: String,
}

#[napi]
impl Task for SetSinkIdTask {
    type Output = ();
    type JsValue = ();

    fn compute(&mut self) -> Result<Self::Output> {
        let result = self.context.set_sink_id_sync(self.sink_id.clone());

        match result {
            Ok(audio_buffer) => Ok(audio_buffer),
            Err(e) => Err(Error::from_reason(e.to_string())),
        }
    }

    fn resolve(&mut self, _: Env, _: Self::Output) -> Result<Self::JsValue> {
        Ok(())
    }
}

#[derive(Clone)]
#[napi]
pub struct NapiAudioContext {
    inner: Arc<AudioContext>,
    destination: NapiAudioDestinationNode,
    render_capacity: NapiAudioRenderCapacity,
    playback_stats: NapiAudioPlaybackStats,
    listener: Option<NapiAudioListener>,
    pub(crate) worklets: Arc<crate::audio_worklet_node::WorkletChannels>,
}

impl NapiAudioContext {
    pub(crate) fn inner(&self) -> &AudioContext {
        &self.inner
    }
}

base_audio_context_impl!(NapiAudioContext, AudioContext);

#[napi]
impl NapiAudioContext {
    #[napi(constructor, catch_unwind)]
    pub fn new(options: Object) -> Self {
        let default_latency_hint = Either::A("interactive".into());
        let default_sample_rate = None;
        let default_sink_id = "".to_string();

        let latency_hint = options.get::<Either<String, f64>>("latencyHint");
        let latency_hint = latency_hint
            .or::<Result<Option<Either<String, f64>>>>(Ok(Some(default_latency_hint.clone())));
        let latency_hint = latency_hint.unwrap().unwrap_or(default_latency_hint);
        let latency_hint = match latency_hint {
            Either::A(latency_hint) => match latency_hint.as_str() {
                "interactive" => AudioContextLatencyCategory::Interactive,
                "balanced" => AudioContextLatencyCategory::Balanced,
                "playback" => AudioContextLatencyCategory::Playback,
                _ => unreachable!(),
            },
            Either::B(latency_hint) => AudioContextLatencyCategory::Custom(latency_hint),
        };

        let sample_rate = options.get::<Either<f64, Null>>("sampleRate");
        let sample_rate = sample_rate.or::<Result<Option<Either<f64, Null>>>>(Ok(None));
        let sample_rate = match sample_rate.unwrap() {
            Some(sample_rate) => match sample_rate {
                Either::A(sample_rate) => Some(sample_rate as f32),
                Either::B(_) => default_sample_rate,
            },
            None => default_sample_rate,
        };

        let sink_id = options.get::<String>("sinkId");
        let sink_id = sink_id.or::<Result<Option<String>>>(Ok(Some(default_sink_id.clone())));
        let sink_id = match sink_id.unwrap() {
            Some(sink_id) => sink_id,
            None => default_sink_id,
        };

        // non-standard: threads rendering the render groups, see `setRenderGroup`
        let render_threads = options.get::<u32>("renderThreads").ok().flatten();
        let render_threads = render_threads.unwrap_or(1) as usize;

        let options = AudioContextOptions {
            latency_hint,
            sample_rate,
            sink_id,
            render_threads,
            ..Default::default()
        };

        let native_context = AudioContext::new(options);

        let native_destination = native_context.destination();
        let napi_destination = NapiAudioDestinationNode::new(native_destination);

        let native_render_capacity = native_context.render_capacity();
        let napi_render_capacity = NapiAudioRenderCapacity::new(native_render_capacity);

        let native_playback_stats = native_context.playback_stats();
        let napi_playback_stats = NapiAudioPlaybackStats::new(native_playback_stats);

        let worklets = Arc::new(crate::audio_worklet_node::WorkletChannels::new());

        Self {
            inner: Arc::new(native_context),
            destination: napi_destination,
            render_capacity: napi_render_capacity,
            playback_stats: napi_playback_stats,
            listener: None,
            worklets,
        }
    }

    #[napi(getter, js_name = "workletId")]
    pub fn worklet_id(&self) -> u32 {
        self.worklets.main() as u32
    }

    #[napi(getter, js_name = "destination")]
    pub fn destination(&self) -> NapiAudioDestinationNode {
        self.destination.clone()
    }

    #[napi(getter, js_name = "renderCapacity")]
    pub fn render_capacity(&self) -> NapiAudioRenderCapacity {
        self.render_capacity.clone()
    }

    #[napi(getter, js_name = "playbackStats")]
    pub fn playback_stats(&self) -> NapiAudioPlaybackStats {
        self.playback_stats.clone()
    }

    #[napi(getter, js_name = "baseLatency")]
    pub fn base_latency(&self) -> f64 {
        self.inner.base_latency()
    }

    #[napi(getter, js_name = "outputLatency")]
    pub fn output_latency(&self) -> f64 {
        self.inner.output_latency()
    }

    #[napi(getter, js_name = "sinkId")]
    pub fn sink_id(&self) -> String {
        self.inner.sink_id()
    }

    // Use task and lib_uv to make rust synchronous method, asynchronous
    #[napi(catch_unwind)]
    pub fn set_sink_id(&self, sink_id: String) -> AsyncTask<SetSinkIdTask> {
        let context = self.inner.clone();
        let task = SetSinkIdTask { context, sink_id };
        AsyncTask::new(task)
    }

    #[napi(catch_unwind)]
    pub async fn resume(&self) -> Result<()> {
        self.inner.resume().await;
        Ok(())
    }

    #[napi(catch_unwind)]
    pub async fn suspend(&self) -> Result<()> {
        self.inner.suspend().await;
        Ok(())
    }

    #[napi(catch_unwind)]
    pub async fn close(&self) -> Result<()> {
        self.inner.close().await;
        Ok(())
    }

    #[napi(catch_unwind)]
    pub fn onsinkchange(&self, callback: Function<NapiEvent, ()>) -> Result<()> {
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

        self.inner.set_onsinkchange(move |e| {
            tsfn.call(
                e,
                napi::threadsafe_function::ThreadsafeFunctionCallMode::Blocking,
            );
        });

        Ok(())
    }

    // Note: #[cfg(feature = "diagnostics")] somehow conflicts with #[napi]
    // Hence we declare the method in all cases and switch cfg inside the body
    // note that `callback` is prefixed with _ to avoid warning in "normal" build
    #[napi(catch_unwind)]
    pub fn run_diagnostics(&self, _callback: Function<(), ()>) -> Result<()> {
        #[cfg(feature = "diagnostics")]
        {
            let tsfn = _callback
                .build_threadsafe_function()
                .weak::<true>() // do not prevent process to exit
                .build_callback(
                    move |ctx: napi::threadsafe_function::ThreadsafeCallContext<
                        web_audio_api::context::AudioContextDiagnostics,
                    >| {
                        let diagnostic =
                            crate::diagnostics::NapiAudioContextDiagnostics::new(ctx.value.clone());

                        Ok(diagnostic)
                    },
                )?;

            self.inner.run_diagnostics(move |e| {
                tsfn.call(
                    e,
                    napi::threadsafe_function::ThreadsafeFunctionCallMode::Blocking,
                );
            });

            return Ok(());
        }

        #[cfg(not(feature = "diagnostics"))]
        {
            Err(napi::Error::from_reason("diagnostic feature not activated"))
        }
    }

    // attribute EventHandler onerror;
    // [SameObject] readonly attribute AudioPlaybackStats playbackStats;
    // AudioTimestamp getOutputTimestamp ();
}
