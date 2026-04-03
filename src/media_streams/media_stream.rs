use napi_derive::napi;

// do not prefix name with Napi as we don't have any JS facade for now, an
// ClassInstance<MediaStream> does not behaves well when js and rust name doesn't match
#[napi]
pub(crate) struct MediaStream {
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
