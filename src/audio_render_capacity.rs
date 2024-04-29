use crate::*;
use napi::*;
use napi_derive::js_function;
use web_audio_api::AudioRenderCapacity;

pub(crate) struct NapiAudioRenderCapacity(AudioRenderCapacity);

impl NapiAudioRenderCapacity {
    pub fn create_js_class(env: &Env) -> Result<JsFunction> {
        env.define_class(
            "AudioRenderCapacity",
            constructor,
            &[
                Property::new("start")?.with_method(start),
                Property::new("stop")?.with_method(stop),
            ],
        )
    }

    pub fn unwrap(&mut self) -> &mut AudioRenderCapacity {
        &mut self.0
    }
}

// https://webaudio.github.io/web-audio-api/#AudioRenderCapacity
#[js_function(1)]
fn constructor(ctx: CallContext) -> Result<JsUndefined> {
    let mut js_this = ctx.this_unchecked::<JsObject>();

    let js_audio_context = ctx.get::<JsObject>(0)?;

    js_this.define_properties(&[
        // this must be put on the instance and not in the prototype to be reachable
        Property::new("Symbol.toStringTag")?
            .with_value(&ctx.env.create_string("AudioRenderCapacity")?)
            .with_property_attributes(PropertyAttributes::Static),
    ])?;

    // create native node
    let audio_context_name =
        js_audio_context.get_named_property::<JsString>("Symbol.toStringTag")?;
    let audio_context_utf8_name = audio_context_name.into_utf8()?.into_owned()?;
    let audio_context_str = &audio_context_utf8_name[..];

    let native_node = match audio_context_str {
        "AudioContext" => {
            let napi_audio_context = ctx.env.unwrap::<NapiAudioContext>(&js_audio_context)?;
            let audio_context = napi_audio_context.unwrap();
            audio_context.render_capacity()
        }
        &_ => unreachable!(),
    };

    // finalize instance creation
    let napi_node = NapiAudioRenderCapacity(native_node);
    ctx.env.wrap(&mut js_this, napi_node)?;

    ctx.env.get_undefined()
}

#[js_function]
fn start(ctx: CallContext) -> Result<JsUndefined> {
    println!("start");
    ctx.env.get_undefined()
}

#[js_function]
fn stop(ctx: CallContext) -> Result<JsUndefined> {
    println!("stop");
    ctx.env.get_undefined()
}
