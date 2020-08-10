import fs from 'fs';
import path from 'path';
import { TreeNode, Options, DirectoryNode } from './types';

const readDirectory = (dir: string, depth: number, options: Options) => {
    // -Lオプションの値と現在の改装を比較して，読み取り不要になったタイミングで再起を中止する
    if (options.level < depth) {
        return [];
    }

    const dirents = fs.readdirSync(dir, {
        withFileTypes: true,
    });

    const nodes: TreeNode[] = [];

    dirents.forEach((dirent) => {
        if (dirent.name.startsWith('.')) {
            return;
        }

        if (dirent.isFile()) {
            nodes.push({
                type: 'file',
                name: dirent.name,
            });
        } else if (dirent.isDirectory()) {
            nodes.push({
                type: 'directory',
                name: dirent.name,
                children: readDirectory(
                    path.join(dir, dirent.name),
                    depth + 1,
                    options,
                ),
            });
        } else if (dirent.isSymbolicLink()) {
            nodes.push({
                type: 'symlink',
                name: dirent.name,
                link: fs.readlinkSync(path.join(dir, dirent.name)),
            });
        }
    });

    return nodes;
};

export const read = (dir: string, options: Options) => {
    let stat: fs.Stats;

    try {
        stat = fs.statSync(dir);
    } catch {
        throw new Error(`"${dir}" does not exist.`);
    }

    if (!stat.isDirectory()) {
        throw new Error(`#${dir}" can't be opend asa a directory.`);
    }


    // readDirectory関数に初期階層とoptionsを渡す
    const root: DirectoryNode = {
        type: 'directory',
        name: dir,
        children: readDirectory(dir, 1, options),
    };

    return root;
};