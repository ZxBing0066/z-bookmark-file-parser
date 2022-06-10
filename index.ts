import { Cheerio, Element, load } from 'cheerio';

interface BookmarkWithOutTag {
    href: string;
    text: string;
    icon?: string;
    addDate: number;
    lastModified?: number;
}

type BookmarkWithTag = BookmarkWithOutTag & {
    tag: string[];
};

// type Bookmark<T extends boolean = false> = T extends true ? BookmarkWithTag : BookmarkWithOutTag;
type Bookmark = BookmarkWithTag;

interface Folder {
    text: string;
    addDate: number;
    lastModified?: number;
    personalToolbarFolder?: boolean;
    list: List;
}

type List = (Bookmark | Folder)[];

const parseTag = (text: string): string[] => {
    const tags = text.match(/\[\#[^[]+?\]/g);
    return tags ? tags.map(tag => tag.replace(/^\[#/, '').replace(/]$/, '')) : [];
};

const parse = (
    content: string,
    options?: {
        tag?: boolean;
    }
): List => {
    const $ = load(content, {
        decodeEntities: false
    });

    const root = $('dl').first();
    const parseA = (el: Cheerio<Element>): Bookmark => {
        return {
            href: el.attr('href')!,
            text: el.text(),
            icon: el.attr('icon'),
            addDate: +el.attr('add_date')!,
            lastModified: el.attr('last_modified') ? +el.attr('last_modified')! : undefined,
            tag: options?.tag ? parseTag(el.text()) : []
        };
    };

    const dig = (el: Cheerio<Element>, depth: number = 0) => {
        const list: List = [];
        el.children().each((i, el) => {
            console.log(new Array(depth).fill(' ').join(''), el.name);
            if (el.name === 'dt') {
                if ($(el).find('>a').length) {
                    list.push(parseA($(el).children().eq(0)));
                } else if ($(el).find('>h3').length) {
                    const h3 = $(el).find('>h3');
                    const dl = $(el).find('>dl');
                    const folder: Folder = {
                        text: h3.text(),
                        addDate: +h3.attr('add_date')!,
                        lastModified: h3.attr('last_modified') ? +h3.attr('last_modified')! : undefined,
                        personalToolbarFolder: h3.attr('personal_toolbar_folder') === 'true',
                        list: dig(dl, depth + 1)
                    };
                    list.push(folder);
                }
            }
        });
        return list;
    };

    return dig(root);
};

export default parse;
