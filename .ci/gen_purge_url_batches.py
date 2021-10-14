#!/usr/bin/python3
#
# Convert a list of changed paths inside the static website root to a series of Cloudflare Purge URLs lists
# See: https://api.cloudflare.com/#zone-purge-files-by-url
#
# Each output JSON file can then be used as the data for a POST zones/:identifier/purge_cache API call

import sys
import argparse
import json
import os
from pathlib import Path

MAX_URLS_PER_BATCH = 30

def generatePurgeURLsList(inputfile: str, domain: str, protocols = ['https', 'http']):
    domain = domain.strip("/")
    urllist = []
    with open(inputfile) as f:
        for line in f:
            path = line.strip().lstrip("/")
            for protocol in protocols:
                urllist.append("{0}://{1}/{2}".format(protocol, domain, path))
                if path.lower().endswith("/index.html"):
                    # Also append the path without the index.html suffix
                    urllist.append("{0}://{1}/{2}".format(protocol, domain, path[:-10]))
    return urllist

def main(argv):    
    parser = argparse.ArgumentParser(description='Convert a list of changed paths inside the static website root to a series of Cloudflare Purge URLs lists')
    parser.add_argument('domain', type=str)
    parser.add_argument('inputfile', type=str)
    parser.add_argument('outputpath', type=str)
    parser.add_argument('-b', '--basefilename', type=str, default='cfpurgedata')
    args = parser.parse_args()
    
    print ('domain is:', args.domain)
    print ('inputfile is:', args.inputfile)
    print ('outputpath is:', args.outputpath)
    
    Path(args.outputpath).mkdir(parents=True, exist_ok=True)
    
    urllist = generatePurgeURLsList(args.inputfile, args.domain)
    
    batch_num = 1
    for i in range(0, len(urllist), MAX_URLS_PER_BATCH):
        output_json = {'files': urllist[i:i + MAX_URLS_PER_BATCH]}
        output_filename = args.basefilename + '-' + str(batch_num) + '.json'
        output_fullpath = os.path.sep.join([args.outputpath, output_filename])
        with open(output_fullpath, 'w', encoding='utf-8') as f:
            json.dump(output_json, f, ensure_ascii=False)
        print ('@ Wrote batch:', output_fullpath)
        print (json.dumps(output_json, ensure_ascii=False, indent=4).encode('utf-8').decode())
        batch_num = batch_num + 1

    print ('Done')

if __name__ == "__main__":
   main(sys.argv[1:])
