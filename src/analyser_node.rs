// ---------------------------------------------------------- //
// ---------------------------------------------------------- //
//    - WARNING - DO NOT EDIT                               - //
//    - This file has been generated                        - //
// ---------------------------------------------------------- //
// ---------------------------------------------------------- //

use std::rc::Rc;
use napi::*;
use napi_derive::js_function;
use web_audio_api::node::*;
use crate::*;

pub(crate) struct NapiAnalyserNode(Rc<AnalyserNode>);

impl NapiAnalyserNode {
    pub fn create_js_class(env: &Env) -> Result<JsFunction> {
        env.define_class(
            "AnalyserNode",
            constructor,
            &[
                // Attributes
                Property::new("minDecibels")?
                    .with_getter(get_min_decibels)
                    .with_setter(set_min_decibels)
                    .with_property_attributes(PropertyAttributes::Enumerable),
                Property::new("maxDecibels")?
                    .with_getter(get_max_decibels)
                    .with_setter(set_max_decibels)
                    .with_property_attributes(PropertyAttributes::Enumerable),
                Property::new("smoothingTimeConstant")?
                    .with_getter(get_smoothing_time_constant)
                    .with_setter(set_smoothing_time_constant)
                    .with_property_attributes(PropertyAttributes::Enumerable),
                
                // Methods
                Property::new("getFloatFrequencyData")?
                    .with_method(get_float_frequency_data)
                    .with_property_attributes(PropertyAttributes::Enumerable),
                Property::new("getByteFrequencyData")?
                    .with_method(get_byte_frequency_data)
                    .with_property_attributes(PropertyAttributes::Enumerable),
                Property::new("getFloatTimeDomainData")?
                    .with_method(get_float_time_domain_data)
                    .with_property_attributes(PropertyAttributes::Enumerable),
                Property::new("getByteTimeDomainData")?
                    .with_method(get_byte_time_domain_data)
                    .with_property_attributes(PropertyAttributes::Enumerable),
                
                // AudioNode interface
                Property::new("connect")?
                    .with_method(connect)
                    .with_property_attributes(PropertyAttributes::Enumerable),
                // Property::new("disconnect")?.with_method(disconnect),
                
            ]
        )
    }

    pub fn unwrap(&self) -> &AnalyserNode {
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
            .with_value(&ctx.env.create_string("AnalyserNode")?)
            .with_property_attributes(PropertyAttributes::Static),
    ])?;

    // parse options
    
    let options = match ctx.try_get::<JsObject>(1)? {
        Either::A(options_js) => {
            
            let some_fft_size_js = options_js.get::<&str, JsNumber>("fftSize")?;
            let fft_size = if let Some(fft_size_js) = some_fft_size_js {
                fft_size_js.get_double()? as usize
            } else {
                2048
            };
                        
            let some_max_decibels_js = options_js.get::<&str, JsNumber>("maxDecibels")?;
            let max_decibels = if let Some(max_decibels_js) = some_max_decibels_js {
                max_decibels_js.get_double()? as f64
            } else {
                -30.
            };
                        
            let some_min_decibels_js = options_js.get::<&str, JsNumber>("minDecibels")?;
            let min_decibels = if let Some(min_decibels_js) = some_min_decibels_js {
                min_decibels_js.get_double()? as f64
            } else {
                -100.
            };
                        
            let some_smoothing_time_constant_js = options_js.get::<&str, JsNumber>("smoothingTimeConstant")?;
            let smoothing_time_constant = if let Some(smoothing_time_constant_js) = some_smoothing_time_constant_js {
                smoothing_time_constant_js.get_double()? as f64
            } else {
                0.8
            };
                        

            AnalyserOptions {
                fft_size, max_decibels, min_decibels, smoothing_time_constant,
                // for channel config
                ..Default::default()
            }
        },
        Either::B(_) => Default::default(),
    };
        


    let native_node = Rc::new(AnalyserNode::new(audio_context, options));
    
    // finalize instance creation
    let napi_node = NapiAnalyserNode(native_node);
    ctx.env.wrap(&mut js_this, napi_node)?;

    ctx.env.get_undefined()
}

// -------------------------------------------------
// AudioNode Interface
// -------------------------------------------------
connect_method!(NapiAnalyserNode);
// disconnect_method!(NapiAnalyserNode);


// -------------------------------------------------
// GETTERS
// -------------------------------------------------

#[js_function(0)]
fn get_min_decibels(ctx: CallContext) -> Result<JsNumber> {
    let js_this = ctx.this_unchecked::<JsObject>();
    let napi_node = ctx.env.unwrap::<NapiAnalyserNode>(&js_this)?;
    let node = napi_node.unwrap();

    let value = node.min_decibels();
    ctx.env.create_double(value as f64)
}
            
#[js_function(0)]
fn get_max_decibels(ctx: CallContext) -> Result<JsNumber> {
    let js_this = ctx.this_unchecked::<JsObject>();
    let napi_node = ctx.env.unwrap::<NapiAnalyserNode>(&js_this)?;
    let node = napi_node.unwrap();

    let value = node.max_decibels();
    ctx.env.create_double(value as f64)
}
            
#[js_function(0)]
fn get_smoothing_time_constant(ctx: CallContext) -> Result<JsNumber> {
    let js_this = ctx.this_unchecked::<JsObject>();
    let napi_node = ctx.env.unwrap::<NapiAnalyserNode>(&js_this)?;
    let node = napi_node.unwrap();

    let value = node.smoothing_time_constant();
    ctx.env.create_double(value as f64)
}
            

// -------------------------------------------------
// SETTERS
// -------------------------------------------------

#[js_function(1)]
fn set_min_decibels(ctx: CallContext) -> Result<JsUndefined> {
    let js_this = ctx.this_unchecked::<JsObject>();
    let napi_node = ctx.env.unwrap::<NapiAnalyserNode>(&js_this)?;
    let node = napi_node.unwrap();

    let value = ctx.get::<JsNumber>(0)?.get_double()? as f64;
    node.set_min_decibels(value);

    ctx.env.get_undefined()
}
            
#[js_function(1)]
fn set_max_decibels(ctx: CallContext) -> Result<JsUndefined> {
    let js_this = ctx.this_unchecked::<JsObject>();
    let napi_node = ctx.env.unwrap::<NapiAnalyserNode>(&js_this)?;
    let node = napi_node.unwrap();

    let value = ctx.get::<JsNumber>(0)?.get_double()? as f64;
    node.set_max_decibels(value);

    ctx.env.get_undefined()
}
            
#[js_function(1)]
fn set_smoothing_time_constant(ctx: CallContext) -> Result<JsUndefined> {
    let js_this = ctx.this_unchecked::<JsObject>();
    let napi_node = ctx.env.unwrap::<NapiAnalyserNode>(&js_this)?;
    let node = napi_node.unwrap();

    let value = ctx.get::<JsNumber>(0)?.get_double()? as f64;
    node.set_smoothing_time_constant(value);

    ctx.env.get_undefined()
}
            

// -------------------------------------------------
// METHODS
// -------------------------------------------------

#[js_function(1)]
fn get_float_frequency_data(ctx: CallContext) -> Result<JsUndefined> {
    let js_this = ctx.this_unchecked::<JsObject>();
    let napi_node = ctx.env.unwrap::<NapiAnalyserNode>(&js_this)?;
    // avoid warnings while we don't support all methods
    #[allow(unused_variables)]
    let node = napi_node.unwrap();

    
    #[allow(clippy::unnecessary_mut_passed)]
    let mut array_js = ctx.get::<JsTypedArray>(0)?.into_value()?;
    let array: &mut [f32] = array_js.as_mut();
                

    node.get_float_frequency_data(array);

    ctx.env.get_undefined()
}

#[js_function(1)]
fn get_byte_frequency_data(ctx: CallContext) -> Result<JsUndefined> {
    let js_this = ctx.this_unchecked::<JsObject>();
    let napi_node = ctx.env.unwrap::<NapiAnalyserNode>(&js_this)?;
    // avoid warnings while we don't support all methods
    #[allow(unused_variables)]
    let node = napi_node.unwrap();

    

    

    ctx.env.get_undefined()
}

#[js_function(1)]
fn get_float_time_domain_data(ctx: CallContext) -> Result<JsUndefined> {
    let js_this = ctx.this_unchecked::<JsObject>();
    let napi_node = ctx.env.unwrap::<NapiAnalyserNode>(&js_this)?;
    // avoid warnings while we don't support all methods
    #[allow(unused_variables)]
    let node = napi_node.unwrap();

    
    #[allow(clippy::unnecessary_mut_passed)]
    let mut array_js = ctx.get::<JsTypedArray>(0)?.into_value()?;
    let array: &mut [f32] = array_js.as_mut();
                

    node.get_float_time_domain_data(array);

    ctx.env.get_undefined()
}

#[js_function(1)]
fn get_byte_time_domain_data(ctx: CallContext) -> Result<JsUndefined> {
    let js_this = ctx.this_unchecked::<JsObject>();
    let napi_node = ctx.env.unwrap::<NapiAnalyserNode>(&js_this)?;
    // avoid warnings while we don't support all methods
    #[allow(unused_variables)]
    let node = napi_node.unwrap();

    

    

    ctx.env.get_undefined()
}



  