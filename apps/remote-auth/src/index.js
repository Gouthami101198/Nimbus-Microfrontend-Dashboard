// Module Federation requires this async boundary: the shared React/ReactDOM
// singletons are negotiated before any federated code runs, so the real entry
// point is deferred into ./bootstrap.
import("./bootstrap");
