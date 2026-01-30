import { DirectoryNode, FileNode } from '@/app/disk/filesystem-node';

describe('filesystem-node', () =>
{
    it('FileNode supports path/data and delete', () =>
    {
        const node = new FileNode('file.txt', 'file.txt', new Uint8Array([1]));
        expect(node.type).toBe('file');
        expect(node.path).toBe('file.txt');
        expect(node.data).toEqual(new Uint8Array([1]));
        expect(node.delete()).toBe(true);

        node.path = 'renamed.txt';
        node.data = new Uint8Array([2, 3]);
        expect(node.path).toBe('renamed.txt');
        expect(node.data).toEqual(new Uint8Array([2, 3]));
    });

    it('DirectoryNode child management and delete rules', () =>
    {
        const dir = new DirectoryNode('dir', 'dir');
        expect(dir.type).toBe('directory');
        expect(dir.data).toBeNull();
        expect(dir.hasChildren).toBe(false);
        expect(dir.delete()).toBe(true);

        const child = new FileNode('a.txt', 'dir/a.txt');
        dir.addChild(child);
        expect(dir.hasChildren).toBe(true);
        expect(dir.getChild('a.txt')).toBe(child);
        expect(dir.delete()).toBe(false);

        expect(dir.removeChild('a.txt')).toBe(true);
        expect(dir.getChild('a.txt')).toBeUndefined();
        expect(dir.delete()).toBe(true);
    });

    it('DirectoryNode updates child paths when path changes', () =>
    {
        const dir = new DirectoryNode('dir', 'dir');
        const child = new FileNode('a.txt', 'dir/a.txt');
        dir.addChild(child);

        dir.path = 'newdir';
        expect(child.path).toBe('newdir/a.txt');
    });

    it('DirectoryNode moveTo succeeds and updates paths and parents', () =>
    {
        const root = new DirectoryNode('', '');
        const oldParent = new DirectoryNode('old', 'old');
        const newParent = new DirectoryNode('new', 'new');
        root.addChild(oldParent);
        root.addChild(newParent);

        const moving = new DirectoryNode('child', 'old/child');
        const file = new FileNode('f.txt', 'old/child/f.txt');
        moving.addChild(file);
        oldParent.addChild(moving);

        const moved = moving.moveTo(oldParent, newParent);
        expect(moved).toBe(true);
        expect(oldParent.getChild('child')).toBeUndefined();
        expect(newParent.getChild('child')).toBe(moving);
        expect(moving.path).toBe('new/child');
        expect(file.path).toBe('new/child/f.txt');
    });

    it('DirectoryNode moveTo rejects invalid targets', () =>
    {
        const self = new DirectoryNode('x', 'x');
        expect(self.moveTo(null, self)).toBe(false);

        const parent = new DirectoryNode('p', 'p');
        const dir = new DirectoryNode('a', 'a');
        parent.addChild(dir);

        const descendantParent = new DirectoryNode('b', 'a/b');
        expect(dir.moveTo(parent, descendantParent)).toBe(false);
    });
});

