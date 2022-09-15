import React, { useRef } from "react";
import axios from "axios"

const FileUploader = () => {
    const data = useRef<any>();
    const worker = useRef<any>();
    const hash = useRef<any>();
    const file = useRef<any>();

    const uploadChunks = async () => {
        const hashCurrent = hash.current;
        
        const requestList = data.current
            .map((li: any) => {
            // .map(({ chunk, hash }: { chunk: any, hash: any }) => {
            const { chunk, hash } = li;
            console.log(li);
            
            console.log(chunk);
            console.log(hash);
            
            console.log(hashCurrent);
            
            
              const formData = new FormData();
              formData.append("chunk", chunk);
              formData.append("hash", hash);
              formData.append("filehash", hashCurrent);
              return { formData };
            })
            .map(async ({ formData }: { formData: any }) => {
            //  return formData;
              console.log(formData);
            
              // request({
              //   url: "http://localhost:3000",
              //   data: formData
              // });
              return axios({
                method: "POST",
                url: "http://localhost:3002/server",
                // url: "http://localhost:3000/server",
                data: formData,
              });
            }
            );
          await Promise.all(requestList); // 并发切片
    
        // data.current = null;
        // worker.current = null;
        // hash.current = null;
        // file.current = null;
    
        // while(requestList.length) {
        //   const formData = requestList[0];
        //   const value = await queueRequest(formData);
        //   console.log(value);
        //   debugger;
        // }
      }
    
      const queueRequest = (formData: any) => {
        return new Promise((resolve, reject) => {
        //   apiUploadUpgradePackage(formData).then(response => {
        //     resolve(formData);
        //   }).catch(error => {
        //     reject(error);
        //   });
        });
      };

    const createFileChunk = (file: any, size = 1 * 1024 * 1024) => {
        // const createFileChunk = (file: any, size = 10 * 1024 * 1024) => {
        const fileChunkList: any[] = [];
        let cur = 0;
        while(cur < file.size) {
          fileChunkList.push({ file: file.slice(cur, cur + size) })
          cur += size;
        }
        return fileChunkList;
      };

      const calculateHash = (fileChunkList: any) => {
        console.log("calculateHash");
        
        return new Promise(resolve => {
            // 添加 worker 属性
            worker.current = new Worker("/hash.js");
            // worker.current = new Worker("/child/admin/hash.js");
            worker.current.postMessage({ fileChunkList });
            worker.current.onmessage = (e: any) => {
              console.log(e.data);
              
              const { hash } = e.data;
              if (hash) {
                console.log(hash, 333);
                
                resolve(hash);
              }
           };
         });
    
      };

    const handleFileChange = (e: any) => {
        // console.log(e);
        // console.log(e.target.files);
        const [__file] = e.target.files;
        if (__file) {
          file.current = __file;
        }    
      };
      const handleUpload = async () => {
        console.log("handleUpload");
        
          if (!file.current) return;
          const fileChunkList = createFileChunk(file.current);
          hash.current = await calculateHash(fileChunkList);
          console.log(hash.current, 9999);
          
          data.current = fileChunkList.map(({ file }, index) => {
            console.log(file, 'file');
            
            return ({
              chunk: file,
              hash: hash.current + "-" + index // hash + 数组下标
            });
          });
          console.log(data.current, 919191);
          console.log(hash.current, 23232323);
          
          await uploadChunks();
      };

    return (
        <div>
             <input type="file" onChange={handleFileChange} />

<button onClick={handleUpload}>上传</button>
        </div>
    )
};

export default FileUploader;