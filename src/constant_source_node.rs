// ---------------------------------------------------------- //
// ---------------------------------------------------------- //
//    - WARNING - DO NOT EDIT                               - //
//    - This file has been generated                        - //
// ---------------------------------------------------------- //
// ---------------------------------------------------------- //

use crate::*;
use napi_derive::js_function;
use std::rc::Rc;
use web_audio_api::node::*;

pub(crate) struct NapiConstantSourceNode(Rc<ConstantSourceNode>);

impl NapiConstantSourceNode {
    pub fn create_js_class(env: &napi::Env) -> napi::Result<napi::JsFunction> {
        env.define_class(
            "ConstantSourceNode",
            constructor,
            &[
                // Attributes

                // Methods

                // AudioNode interface
                napi::Property::new("connect")?
                    .with_method(connect)
                    .with_property_attributes(napi::PropertyAttributes::Enumerable),
                // napi::Property::new("disconnect")?.with_method(disconnect),

                // AudioScheduledSourceNode interface
                napi::Property::new("start")?
                    .with_method(start)
                    .with_property_attributes(napi::PropertyAttributes::Enumerable),
                napi::Property::new("stop")?
                    .with_method(stop)
                    .with_property_attributes(napi::PropertyAttributes::Enumerable),
            ],
        )
    }

    pub fn unwrap(&self) -> &ConstantSourceNode {
        &self.0
    }
}

#[js_function(2)]
fn constructor(ctx: napi::CallContext) -> napi::Result<napi::JsUndefined> {
    let mut js_this = ctx.this_unchecked::<napi::JsObject>();

    // first argument is always AudioContext
    let js_audio_context = ctx.get::<napi::JsObject>(0)?;
    let napi_audio_context = ctx.env.unwrap::<NapiAudioContext>(&js_audio_context)?;
    let audio_context = napi_audio_context.unwrap();

    js_this.define_properties(&[
        napi::Property::new("context")?
            .with_value(&js_audio_context)
            .with_property_attributes(napi::PropertyAttributes::Enumerable),
        // this must be put on the instance and not in the prototype to be reachable
        napi::Property::new("Symbol.toStringTag")?
            .with_value(&ctx.env.create_string("ConstantSourceNode")?)
            .with_property_attributes(napi::PropertyAttributes::Static),
    ])?;

    // parse options

    let options = match ctx.try_get::<napi::JsObject>(1)? {
        napi::Either::A(options_js) => {
            let some_offset_js = options_js.get::<&str, napi::JsNumber>("offset")?;
            let offset = if let Some(offset_js) = some_offset_js {
                offset_js.get_double()? as f32
            } else {
                1.
            };

            ConstantSourceOptions { offset }
        }
        napi::Either::B(_) => {
            return Err(napi::Error::from_reason(
                "Options are mandatory for node ConstantSourceNode".to_string(),
            ));
        }
    };

    let native_node = Rc::new(ConstantSourceNode::new(audio_context, options));

    // AudioParam: ConstantSourceNode::offset
    let native_clone = native_node.clone();
    let param_getter = ParamGetter::ConstantSourceNodeOffset(native_clone);
    let napi_param = NapiAudioParam::new(param_getter);
    let mut js_obj = NapiAudioParam::create_js_object(ctx.env)?;
    ctx.env.wrap(&mut js_obj, napi_param)?;
    js_this.set_named_property("offset", &js_obj)?;

    // finalize instance creation
    let napi_node = NapiConstantSourceNode(native_node);
    ctx.env.wrap(&mut js_this, napi_node)?;

    ctx.env.get_undefined()
}

// -------------------------------------------------
// AudioNode Interface
// -------------------------------------------------
connect_method!(NapiConstantSourceNode);
// disconnect_method!(NapiConstantSourceNode);

// -------------------------------------------------
// AudioScheduledSourceNode Interface
// -------------------------------------------------
#[js_function(1)]
fn start(ctx: napi::CallContext) -> napi::Result<napi::JsUndefined> {
    let js_this = ctx.this_unchecked::<napi::JsObject>();
    let napi_node = ctx.env.unwrap::<NapiConstantSourceNode>(&js_this)?;
    let node = napi_node.unwrap();

    if ctx.length == 0 {
        node.start();
    } else {
        let when = ctx.get::<napi::JsNumber>(0)?.try_into()?;
        node.start_at(when);
    }

    ctx.env.get_undefined()
}

#[js_function(1)]
fn stop(ctx: napi::CallContext) -> napi::Result<napi::JsUndefined> {
    let js_this = ctx.this_unchecked::<napi::JsObject>();
    let napi_node = ctx.env.unwrap::<NapiConstantSourceNode>(&js_this)?;
    let node = napi_node.unwrap();

    if ctx.length == 0 {
        node.stop();
    } else {
        let when = ctx.get::<napi::JsNumber>(0)?.try_into()?;
        node.stop_at(when);
    };

    ctx.env.get_undefined()
}

// -------------------------------------------------
// GETTERS
// -------------------------------------------------

// -------------------------------------------------
// SETTERS
// -------------------------------------------------

// -------------------------------------------------
// METHODS
// -------------------------------------------------
