import { useRef, useEffect } from 'react';

export function getSectionListData(data) {

  console.log("=======getSectionListData============")
console.log(data)
  console.log("=======getSectionListData============")
  let structuredSectionData = [];
  data.map(item => {
    let obj = structuredSectionData.find(
      x =>
        x.name == item.category.charAt(0).toUpperCase() + item.category.slice(1)
    );
    if (obj) {
      structuredSectionData[structuredSectionData.indexOf(obj)].data.push({
        id: item.id,
        name: item.name,
        price: item.price,
        description: item.description,
        image: item.image,
      });
    } else {
      structuredSectionData.push({
        name: item.category.charAt(0).toUpperCase() + item.category.slice(1),
        data: [
          {
            id: item.id,
            name: item.name,
            price: item.price,
            description: item.description,
            image: item.image,
          },
        ],
      });
    }
  });
  return structuredSectionData;
}

/**
 * 3. Implement this function to transform the raw data
 * retrieved by the getMenuItems() function inside the database.js file
 * into the data structure a SectionList component expects as its "sections" prop.
 * @see https://reactnative.dev/docs/sectionlist as a reference
 */


// export function getSectionListData(data) {
//   const categoryItems = data.reduce((acc, curr) => {
//     const menuItem = {
//       id: curr.id,
//       title: curr.title,
//       price: curr.price,
//     };
//     if (!Array.isArray(acc[curr.category])) {
//       acc[curr.category] = [menuItem];
//     } else {
//       acc[curr.category].push(menuItem);
//     }
//     return acc;
//   }, {});

//   const sectionListData = Object.entries(categoryItems).map(([key, item]) => {
//     return {
//       title: key,
//       data: item,
//     };
//   });
//   return sectionListData;
// }

export function useUpdateEffect(effect, dependencies = []) {
  const isInitialMount = useRef(true);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
    } else {
      return effect();
    }
  }, dependencies);
}

export const validateEmail = email => {
  return email.match(
    /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
  );
};

export const validateName = name => {
  return name.match(/^[a-zA-Z]+$/);
};
