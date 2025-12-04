import { IService, IAction, IReaction } from '../interfaces/service.interface';

class ServiceManager {
  private services: Map<string, IService> = new Map();

  register(service: IService) {
    if (this.services.has(service.id)) {
      console.warn(`Service ${service.id} already registered! Overwriting.`);
    }
    this.services.set(service.id, service);
    console.log(`[ServiceManager] Registered service: ${service.name}`);
  }

  getAllServices(): IService[] {
    return Array.from(this.services.values());
  }

  getService(id: string): IService | undefined {
    return this.services.get(id);
  }

  getAction(serviceId: string, actionId: string): IAction | undefined {
    return this.services.get(serviceId)?.actions.find(a => a.id === actionId);
  }

  getReaction(serviceId: string, reactionId: string): IReaction | undefined {
    return this.services.get(serviceId)?.reactions.find(r => r.id === reactionId);
  }
}

export const serviceManager = new ServiceManager();
