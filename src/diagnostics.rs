use napi_derive::napi;

use web_audio_api::context::AudioContextDiagnostics;

// Simplified diagnostics wrapper (to be completed)

#[napi(object)]
pub struct NapiAudioContextDiagnostics {
    // Audio backend details collected on the control thread.
    pub backend: NapiAudioBackendDiagnostics,
    // Render thread details collected on the render thread.
    pub render_thread: NapiAudioRenderThreadDiagnostics,
    // Audio graph details collected on the render thread.
    pub graph: NapiAudioGraphDiagnostics,
}

impl NapiAudioContextDiagnostics {
    pub(crate) fn new(diagnostics: AudioContextDiagnostics) -> NapiAudioContextDiagnostics {
        let AudioContextDiagnostics {
            backend,
            render_thread,
            graph,
            ..
        } = diagnostics;

        let backend = NapiAudioBackendDiagnostics {
            name: backend.name,
            sink_id: backend.sink_id,
            output_latency: backend.output_latency,
        };

        let render_thread = NapiAudioRenderThreadDiagnostics {
            sample_rate: render_thread.sample_rate as f64,
            buffer_size: render_thread.buffer_size as f64,
            frames_played: render_thread.frames_played as f64,
            number_of_channels: render_thread.number_of_channels as f64,
            suspended: render_thread.suspended,
        };

        let graph = NapiAudioGraphDiagnostics {
            active: graph.active,
            node_count: graph.node_count as f64,
            edge_count: graph.edge_count as f64,
        };

        Self {
            backend,
            render_thread,
            graph,
        }
    }
}

#[napi(object)]
pub struct NapiAudioBackendDiagnostics {
    /// Backend implementation name.
    pub name: String,
    /// Current audio output device id.
    pub sink_id: String,
    /// Current output latency in seconds, if the backend can report it.
    pub output_latency: Option<f64>,
}

#[napi(object)]
pub struct NapiAudioRenderThreadDiagnostics {
    /// Render thread sample rate in Hz.
    pub sample_rate: f64,
    /// Backend callback buffer size in frames.
    pub buffer_size: f64,
    /// Number of frames played by the backend.
    pub frames_played: f64,
    /// Number of output channels used by the backend stream.
    pub number_of_channels: f64,
    /// Whether rendering is currently suspended.
    pub suspended: bool,
}

#[napi(object)]
pub struct NapiAudioGraphDiagnostics {
    /// Whether the graph is loaded
    pub active: bool,
    /// Number of registered nodes.
    pub node_count: f64,
    /// Number of outgoing graph connections.
    pub edge_count: f64,
    // /// Node ids in the current render ordering.
    // pub ordered: Vec<u64>,
    // /// Node ids currently excluded from rendering because they are in an unbreakable cycle.
    // pub in_cycle: Vec<u64>,
    // /// Node ids marked as eligible cycle breakers.
    // pub cycle_breakers: Vec<u64>,
    // /// Registered audio nodes.
    // pub nodes: Vec<AudioNodeDiagnostics>,
}
