# _shared

Legacy aggregator shims that mirror the old `src/models/*.ts` files.
They simply re-export from the new modular locations so existing
imports keep working without touching every call site.

You can inline these re-exports into their consumers and delete this
folder at your leisure.
