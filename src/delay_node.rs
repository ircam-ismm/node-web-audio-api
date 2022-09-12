// ---------------------------------------------------------- //
// ---------------------------------------------------------- //
//    - WARNING - DO NOT EDIT                               - //
//    - This file has been generated                        - //
// ---------------------------------------------------------- //
// ---------------------------------------------------------- //

use crate::*;
use napi::*;
use napi_derive::js_function;
use std::rc::Rc;
use web_audio_api::node::*;

pub(crate) struct NapiDelayNode(Rc<DelayNode>);

impl NapiDelayNode {
    pub fn create_js_class(env: &Env) -> Result<JsFunction> {
        env.define_class(
            "DelayNode",
            constructor,
            &[
                // Attributes

                // Methods

                // AudioNode interface
                Property::new("connect")?
                    .with_method(connect)
                    .with_property_attributes(PropertyAttributes::Enumerable),
                // Property::new("disconnect")?.with_method(disconnect),
            ],
        )
    }

    pub fn unwrap(&self) -> &DelayNode {
        &self.0
    }
}

#[js_function(2)]
fn constructor(ctx: CallContext) -> Result<JsUndefined> {
    let mut js_this = ctx.this_unchecked::<JsObject>();

    // first argument is always AudioContext
    let js_audio_context = ctx.get::<JsObject>(0)?;
    let napi_audio_context = ctx.env.unwrap::<NapiAudioContext>(&js_audio_context)?;
    let audio_context = napi_audio_context.unwrap();

    js_this.define_properties(&[
        Property::new("context")?
            .with_value(&js_audio_context)
            .with_property_attributes(PropertyAttributes::Enumerable),
        // this must be put on the instance and not in the prototype to be reachable
        Property::new("Symbol.toStringTag")?
            .with_value(&ctx.env.create_string("DelayNode")?)
            .with_property_attributes(PropertyAttributes::Static),
    ])?;

    let options = match ctx.try_get::<JsObject>(1)? {
        Either::A(options_js) => {
            let some_max_delay_time_js = options_js.get::<&str, JsNumber>("maxDelayTime")?;
            let max_delay_time = if let Some(max_delay_time_js) = some_max_delay_time_js {
                max_delay_time_js.get_double()? as f64
            } else {
                1.
            };

            let some_delay_time_js = options_js.get::<&str, JsNumber>("delayTime")?;
            let delay_time = if let Some(delay_time_js) = some_delay_time_js {
                delay_time_js.get_double()? as f64
            } else {
                0.
            };

            DelayOptions {
                max_delay_time,
                delay_time,
                channel_config: ChannelConfigOptions::default(),
            }
        }
        Either::B(_) => Default::default(),
    };

    let native_node = Rc::new(DelayNode::new(audio_context, options));

    // AudioParam: DelayNode::delayTime
    let native_clone = native_node.clone();
    let param_getter = ParamGetter::DelayNodeDelayTime(native_clone);
    let napi_param = NapiAudioParam::new(param_getter);
    let mut js_obj = NapiAudioParam::create_js_object(ctx.env)?;
    ctx.env.wrap(&mut js_obj, napi_param)?;
    js_this.set_named_property("delayTime", &js_obj)?;

    // finalize instance creation
    let napi_node = NapiDelayNode(native_node);
    ctx.env.wrap(&mut js_this, napi_node)?;

    ctx.env.get_undefined()
}

// -------------------------------------------------
// AudioNode Interface
// -------------------------------------------------
connect_method!(NapiDelayNode);
// disconnect_method!(NapiDelayNode);

// -------------------------------------------------
// GETTERS
// -------------------------------------------------

// -------------------------------------------------
// SETTERS
// -------------------------------------------------

// -------------------------------------------------
// METHODS
// -------------------------------------------------
