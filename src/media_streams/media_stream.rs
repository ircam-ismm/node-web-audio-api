use napi_derive::napi;

// @note
// - Name is not prefixed with `Napi` as we don't have any JS facade for now
// - `ClassInstance<MediaStream>` does not behaves well when js and rust name don't match
#[napi]
pub struct MediaStream {
    pub(crate) inner: web_audio_api::media_streams::MediaStream,
}

impl MediaStream {
    pub fn new(stream: web_audio_api::media_streams::MediaStream) -> Self {
        Self { inner: stream }
    }

    pub fn inner(&self) -> &web_audio_api::media_streams::MediaStream {
        &self.inner
    }
}
