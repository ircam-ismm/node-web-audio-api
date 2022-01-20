// ----------------------------------------------------------
// /!\ WARNING
// This file has been generated, do not edit
// ----------------------------------------------------------

use std::rc::Rc;
use napi::*;
use napi_derive::js_function;
use web_audio_api::*;
use crate::*;

pub(crate) struct ${d.napiName}(Rc<${d.name}>);

impl ${d.napiName} {
    pub fn create_js_class(env: &Env) -> Result<JsFunction> {
        env.define_class(
            "${d.name}",
            constructor,
            &[
                // Attributes
                ${d.attributes.map(attr => `Property::new("${attr.name}")?
                    .with_getter(get_${d.slugify(attr.name)})${attr.readonly === false ? `
                    .with_setter(set_${d.slugify(attr.name)})` : ``},
                `
                ).join('')}
                // Methods
                ${d.methods.map(method => `Property::new("${method.name}")?
                    .with_method(${d.slugify(method.name)}),
                `
                ).join('')}
                // AudioNode interface
                Property::new("connect")?.with_method(connect),
                // Property::new("disconnect")?.with_method(disconnect),
                ${d.inherit === 'AudioScheduledSourceNode' ?
                `
                // AudioScheduledSourceNode interface
                Property::new("start")?.with_method(start),
                Property::new("stop")?.with_method(stop),` : ``
                }
            ]
        )
    }

    pub fn unwrap(&self) -> &${d.name} {
        &self.0
    }
}

#[js_function(1)]
fn constructor(ctx: CallContext) -> Result<JsUndefined> {
    let mut js_this = ctx.this_unchecked::<JsObject>();

    let js_audio_context = ctx.get::<JsObject>(0)?;
    let napi_audio_context = ctx.env.unwrap::<NapiAudioContext>(&js_audio_context)?;
    let audio_context = napi_audio_context.unwrap();

    js_this.set_named_property("Symbol.toStringTag", ctx.env.create_string("${d.name}")?)?;

    let native_node = Rc::<${d.name}>::new(audio_context, Default::default()));
    ${d.audioParams.map((param) => {
        return `
    // AudioParam: ${d.name}::${param.name}
    let native_clone = native_node.clone();
    let param_getter = ParamGetter::${d.name}_${param.name}(native_clone);
    let napi_param = NapiAudioParam::new(param_getter);
    let mut js_obj = NapiAudioParam::create_js_object(ctx.env)?;
    ctx.env.wrap(&mut js_obj, napi_param)?;
    js_this.set_named_property("${param.name}", &js_obj)?;
        `;
    })}
    // finalize instance creation
    let napi_node = ${d.napiName}(native_node);
    ctx.env.wrap(&mut js_this, napi_node)?;

    ctx.env.get_undefined()
}

// AudioNode interface
connect_method!(${d.napiName});
// disconnect_method!(${d.napiName});
${d.inherit === 'AudioScheduledSourceNode' ?
`
// AudioScheduledSourceNode interface
${d.name !== 'AudioBufferSourceNode' ?
`#[js_function(1)]` :
`#[js_function(3)]`
}
fn start(ctx: CallContext) -> Result<JsUndefined> {
    let js_this = ctx.this_unchecked::<JsObject>();
    let napi_node = ctx.env.unwrap::<${d.napiName}>(&js_this)?;
    let node = napi_node.unwrap();
${d.name !== 'AudioBufferSourceNode' ?
`
    if ctx.length == 0 {
        node.start();
    } else {
        let when = ctx.get::<JsNumber>(0)?.try_into()?;
        node.start_at(when);
    };
` : `
    if ctx.length == 0 {
        node.start();
    } else if ctx.length == 1 {
        let when = ctx.get::<JsNumber>(0)?.try_into()?;
        node.start_at(when);
    } else if ctx.length == 2 {
        let when = ctx.get::<JsNumber>(0)?.try_into()?;
        let offset = ctx.get::<JsNumber>(1)?.try_into()?;
        node.start_at_with_offset(when, offset);
    } else if ctx.length == 3 {
        let when = ctx.get::<JsNumber>(0)?.try_into()?;
        let offset = ctx.get::<JsNumber>(1)?.try_into()?;
        let duration = ctx.get::<JsNumber>(2)?.try_into()?;
        node.start_at_with_offset_and_duration(when, offset, duration);
    };
`}
    ctx.env.get_undefined()
}

#[js_function(1)]
fn stop(ctx: CallContext) -> Result<JsUndefined> {
    let js_this = ctx.this_unchecked::<JsObject>();
    let napi_node = ctx.env.unwrap::<${d.napiName}>(&js_this)?;
    let node = napi_node.unwrap();

    if ctx.length == 0 {
        node.stop();
    } else {
        let when = ctx.get::<JsNumber>(0)?.try_into()?;
        node.stop_at(when);
    };

    ctx.env.get_undefined()
}
`
: ``
}
