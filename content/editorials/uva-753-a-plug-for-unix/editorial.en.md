# Model directed adapter chains and physical sockets as maximum flow

## Problem and constraints

There are up to 100 physical receptacles, 100 devices, and 100 adapter types. Each device needs one receptacle and each physical receptacle powers at most one device. Adapter types have unlimited supply and may be chained. Minimize the number of unplugged devices. An adapter is directed: its listed receptacle type accepts a device, and its listed plug type continues toward a wall outlet.

## Building the approach

Create one vertex for every connector type. If an adapter offers receptacle type `A` and has plug type `B`, a device needing A can use it and then needs a B receptacle, so add directed edge `A -> B`. Give adapter edges capacity `m`, enough for all devices, because supply is unlimited.

Add a source with one capacity unit to a type vertex for each device. Add one capacity unit from a type vertex to the sink for each physical outlet. Maximum flow is the greatest number of devices that can follow directed adapter chains to distinct outlets; subtract it from `m`.

Devices or outlets of the same type remain separate source or sink edges. Their shared type vertex aggregates compatibility without discarding physical multiplicity.

## Walkthrough

Two A devices, one B outlet, one C outlet, and adapters `A->X`, `X->B`, `X->C` can power both devices. Edge `A->X` must carry two units; capacity one would incorrectly strand one. Conversely, adapter `B->A` cannot be reversed to connect an A device to a B outlet.

## Why it works

Any legal connection for one device traces a directed path from its type through adapters to one physical outlet, giving one source-to-sink flow unit. Device and outlet capacities enforce their one-use limits, while large adapter capacities impose no false scarcity. Conversely, integral maximum flow decomposes into unit paths, each selecting one device, a legal directed adapter chain, and one distinct outlet; removable flow cycles change no connection count. Thus maximum flow equals the maximum powered devices and its complement is the minimum unplugged count.

## Complexity

For type vertices plus source and sink `V`, and all device, outlet, and adapter edges `E`, Dinic uses `O(V^2E)` as a general bound and `O(V+E)` storage. Here the graph and total flow are both at most a few hundred.

## Common mistakes

- Treating adapter compatibility as undirected.
- Giving one capacity unit to an unlimited adapter type.
- Deduplicating same-type devices or outlets.
- Allowing only one adapter step instead of arbitrary chains.
- Printing the maximum connected count rather than the disconnected count.
