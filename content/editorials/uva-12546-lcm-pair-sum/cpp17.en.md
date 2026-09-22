`power` starts at one. Each loop adds the current power to `lower` before multiplying by the prime, so after `a` iterations `lower` contains powers zero through `a-1` and `power` equals `r^a`, all modulo `MOD`.

The factor adds `(exponent+1)*power` for every possible second exponent when the first is maximal. `ordered` multiplies local weighted factors, while `number` multiplies maximal powers. Their final modular sum performs the diagonal repair without ever constructing the full integer.
