use napi_derive::js_function;
use napi::{CallContext, JsObject, JsString, Result};

// dumb method provided to mock an xhr call and mimick browser's API
#[js_function(1)]
pub fn load(ctx: CallContext) -> Result<JsObject> {
    let js_path = ctx.get::<JsString>(0)?;

    let mut js_obj = ctx.env.create_object()?;
    js_obj.set_named_property("path", js_path)?;

    Ok(js_obj)
}
