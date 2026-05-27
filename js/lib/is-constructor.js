// cf. https://stackoverflow.com/a/46759625
export function isConstructor(f) {
  try {
    Reflect.construct(String, [], f);
  } catch {
    return false;
  }
  return true;
}
