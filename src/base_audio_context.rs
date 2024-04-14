#[macro_export]
macro_rules! base_audio_context_interface {
    [$($e:expr),*] => {
        [
            Property::new("currentTime")?.with_getter(get_current_time),
            Property::new("sampleRate")?.with_getter(get_sample_rate),
            Property::new("listener")?.with_getter(get_listener),
            Property::new("state")?.with_getter(get_state),
            Property::new("decodeAudioData")?.with_method(decode_audio_data),
            $($e,)*
        ]
    }
}

#[macro_export]
macro_rules! base_audio_context_impl {
    ($napi_struct:ident) => {
        #[js_function]
        fn get_current_time(ctx: CallContext) -> Result<JsNumber> {
            let js_this = ctx.this_unchecked::<JsObject>();
            let napi_obj = ctx.env.unwrap::<$napi_struct>(&js_this)?;
            let obj = napi_obj.unwrap();

            let current_time = obj.current_time();
            ctx.env.create_double(current_time)
        }

        #[js_function]
        fn get_sample_rate(ctx: CallContext) -> Result<JsNumber> {
            let js_this = ctx.this_unchecked::<JsObject>();
            let napi_obj = ctx.env.unwrap::<$napi_struct>(&js_this)?;
            let obj = napi_obj.unwrap();

            let sample_rate = obj.sample_rate() as f64;
            ctx.env.create_double(sample_rate)
        }

        // use a getter so we can lazily create the listener on first call and retrieve it afterward
        #[js_function]
        fn get_listener(ctx: CallContext) -> Result<JsObject> {
            let mut js_this = ctx.this_unchecked::<JsObject>();

            // reproduce lazy instanciation strategy from rust crate
            if js_this.has_named_property("__listener__").ok().unwrap() {
                js_this.get_named_property("__listener__")
            } else {
                let store_ref: &mut napi::Ref<()> = ctx.env.get_instance_data()?.unwrap();
                let store: JsObject = ctx.env.get_reference_value(store_ref)?;
                let ctor: JsFunction = store.get_named_property("AudioListener")?;
                let js_obj = ctor.new_instance(&[&js_this])?;
                js_this.set_named_property("__listener__", &js_obj)?;

                Ok(js_obj)
            }
        }

        #[js_function]
        fn get_state(ctx: CallContext) -> Result<JsString> {
            let js_this = ctx.this_unchecked::<JsObject>();
            let napi_obj = ctx.env.unwrap::<$napi_struct>(&js_this)?;
            let obj = napi_obj.unwrap();

            let state = obj.state();
            let state_str = match state {
                AudioContextState::Suspended => "suspended",
                AudioContextState::Running => "running",
                AudioContextState::Closed => "closed",
            };

            ctx.env.create_string(state_str)
        }

        // ----------------------------------------------------
        // METHODS
        // ----------------------------------------------------

        #[js_function(1)]
        fn decode_audio_data(ctx: CallContext) -> Result<JsObject> {
            let js_this = ctx.this_unchecked::<JsObject>();
            let napi_obj = ctx.env.unwrap::<$napi_struct>(&js_this)?;
            let clone = Arc::clone(&napi_obj.context);

            let js_buffer = ctx.get::<JsArrayBuffer>(0)?.into_value()?;
            let cursor = Cursor::new(js_buffer.to_vec());

            ctx.env.execute_tokio_future(
                async move { Ok(clone.decode_audio_data_sync(cursor)) },
                |&mut env, result| {
                    match result {
                        Ok(audio_buffer) => {
                            // create js audio buffer instance
                            let store_ref: &mut napi::Ref<()> = env.get_instance_data()?.unwrap();
                            let store: JsObject = env.get_reference_value(store_ref)?;
                            let ctor: JsFunction = store.get_named_property("AudioBuffer")?;
                            let mut options = env.create_object()?;
                            options.set("__internal_caller__", env.get_null())?;

                            // populate with audio buffer
                            let js_audio_buffer = ctor.new_instance(&[options])?;
                            let napi_audio_buffer =
                                env.unwrap::<NapiAudioBuffer>(&js_audio_buffer)?;
                            napi_audio_buffer.populate(audio_buffer);

                            Ok(js_audio_buffer)
                        }
                        Err(e) => Err(napi::Error::from_reason(e.to_string())),
                    }
                },
            )
        }
    };
}
