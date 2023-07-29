const arr1 = [{type:1},{type:2},{type:3},{type:4},{type:5},{type:6},{type:7}];

// const result = arr1.flatMap((n1,n2,n3) => console.log(`1: ${n1}, 2: ${n2}, 3: ${n3}`));

const permutator = (inputArr) => {
    let result = [];
  
    const permute = (arr, m = []) => {
      if (arr.length === 0) {
        console.log(m);
      } else {
        for (let i = 0; i < arr.length; i++) {
          let curr = arr.slice();
          let next = curr.splice(i, 1);
          permute(curr.slice(), m.concat(next))
       }
     }
   }
  
   permute(inputArr)
  
   return result;
}

permutator(arr1)