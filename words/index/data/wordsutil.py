import sys
import os
import json

def __to_json(inpath, outpath, limit=100):

    objs = []

    with open(inpath) as f, open(inpath + '.tmp', 'w') as tmp, \
        open(outpath, 'w', encoding='utf-8') as out:
        for x in range(limit):
            word = next(f)[:-1]
            meaning = input('[%s]' % word)
            objs.append({
                'word': word,
                'meaning': meaning
            })
        json.dump(objs, out, ensure_ascii=False, indent=2)
        for line in f:
            tmp.write(line)
    
    os.remove(inpath)
    os.rename(inpath + '.tmp', inpath)

def main():

    raw_path = sys.argv[1]
    out = sys.argv[2]

    __to_json(raw_path, out)


if __name__ == '__main__':
    main()
