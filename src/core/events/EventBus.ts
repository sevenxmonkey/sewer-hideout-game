type Handler<T = any> = (payload: T) => void;

class EventBus {
  private handlers: Map<string, Set<Handler>> = new Map();

  on<T = any>(event: string, handler: Handler<T>) {
    if (!this.handlers.has(event)) this.handlers.set(event, new Set());
    this.handlers.get(event)!.add(handler as Handler);
    return () => this.off(event, handler);
  }

  off<T = any>(event: string, handler: Handler<T>) {
    this.handlers.get(event)?.delete(handler as Handler);
  }

  emit<T = any>(event: string, payload?: T) {
    this.handlers.get(event)?.forEach((h) => h(payload));
  }
}

export default new EventBus();
