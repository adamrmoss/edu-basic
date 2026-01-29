import { TabSwitchService } from '../src/app/tab-switch.service';

describe('TabSwitchService', () => {
    it('should emit requested tab id', (done) => {
        const service = new TabSwitchService();

        const subscription = service.switchTab$.subscribe(tabId => {
            expect(tabId).toBe('disk');
            subscription.unsubscribe();
            done();
        });

        service.requestTabSwitch('disk');
    });
});
