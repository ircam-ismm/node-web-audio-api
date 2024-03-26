use crate::*;
use napi::*;
use napi_derive::js_function;
use web_audio_api::*;

pub(crate) struct NapiPeriodicWave(PeriodicWave);

impl NapiPeriodicWave {
    pub fn create_js_class(env: &Env) -> Result<JsFunction> {
        env.define_class("PeriodicWave", constructor, &[])
    }

    // is this false clippy positive?
    #[allow(dead_code)]
    pub fn unwrap(&self) -> &PeriodicWave {
        &self.0
    }
}

#[js_function(2)]
fn constructor(ctx: CallContext) -> Result<JsUndefined> {
    let mut js_this = ctx.this_unchecked::<JsObject>();

    let js_audio_context = ctx.get::<JsObject>(0)?;
    // parse options
    let options = match ctx.try_get::<JsObject>(1)? {
        Either::A(options_js) => {
            let real = if let Some(real_js) = options_js.get::<&str, JsTypedArray>("real")? {
                let real_value = real_js.into_value()?;
                let real: &[f32] = real_value.as_ref();
                Some(real.to_vec())
            } else {
                None
            };

            let imag = if let Some(imag_js) = options_js.get::<&str, JsTypedArray>("imag")? {
                let imag_value = imag_js.into_value()?;
                let imag: &[f32] = imag_value.as_ref();
                Some(imag.to_vec())
            } else {
                None
            };

            let disable_normalization = if let Some(js_value) =
                options_js.get::<&str, JsBoolean>("disableNormalization")?
            {
                js_value.try_into()?
            } else {
                false
            };

            PeriodicWaveOptions {
                real,
                imag,
                disable_normalization,
            }
        }
        Either::B(_) => PeriodicWaveOptions::default(),
    };

    let audio_context_name =
        js_audio_context.get_named_property::<JsString>("Symbol.toStringTag")?;
    let audio_context_utf8_name = audio_context_name.into_utf8()?.into_owned()?;
    let audio_context_str = &audio_context_utf8_name[..];
    // create native node
    let periodic_wave = match audio_context_str {
        "AudioContext" => {
            let napi_audio_context = ctx.env.unwrap::<NapiAudioContext>(&js_audio_context)?;
            let audio_context = napi_audio_context.unwrap();
            PeriodicWave::new(audio_context, options)
        }
        "OfflineAudioContext" => {
            let napi_audio_context = ctx
                .env
                .unwrap::<NapiOfflineAudioContext>(&js_audio_context)?;
            let audio_context = napi_audio_context.unwrap();
            PeriodicWave::new(audio_context, options)
        }
        &_ => unreachable!(),
    };

    js_this.define_properties(&[
        // @todo - review
        Property::new("Symbol.toStringTag")?
            .with_value(&ctx.env.create_string("PeriodicWave")?)
            .with_property_attributes(PropertyAttributes::Static),
    ])?;

    let napi_periodic_wave = NapiPeriodicWave(periodic_wave);
    ctx.env.wrap(&mut js_this, napi_periodic_wave)?;

    ctx.env.get_undefined()
}
