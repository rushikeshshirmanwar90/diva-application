import { StyleSheet, View, Image } from "react-native";
import CategoryBar from "../components/FilterButton";
import ProductList from "../components/Products";
import { useRoute } from "@react-navigation/native";
import React, { useState, useEffect } from "react";
import { Product } from "../interface/Product";
import { domain } from "../components/route/route";

const CategoryDetail = ({ navigation }) => {
  const router = useRoute();

  const data: any = router.params;
 
  console.log(data.banner);

  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [categoryProduct, setCategoryProduct] = useState<Product[]>();
  const [productLoaded, setProductLoaded] = useState<boolean>(true);

  useEffect(() => {
    const fetchData = async () => {
      let currentPage = 1;
      let totalPages = 1;
      let fetchedProducts = [];

      while (currentPage <= totalPages) {
        const products = await fetchProducts(currentPage);
        fetchedProducts.push(...products.data);
        totalPages = products.meta.pagination.pageCount;
        currentPage++;
      }

      const productsArray = Object.values(fetchedProducts);

      const tmp = productsArray.flat();

      setAllProducts(tmp);

      const categoryProduct1 = tmp.filter(
        (i: Product) => i.attributes.category.data.id == data.id
      );
      setCategoryProduct(categoryProduct1);
      setProductLoaded(false);
    };

    fetchData();
  }, [data.id, productLoaded]);

  const fetchProducts = async (page: number) => {
    const response = await fetch(
      `${domain}/api/products?populate=*&pagination[pageSize]=100&pagination[page]=${page}`
    );
    return response.json();
  };

  return (
    <View
      style={{
        marginTop: 2,
      }}
    >
      <View>
        <Image
          source={{
            uri: data.banner,
          }}
          height={210}
          style={{
            borderRadius: 10,
          }}
        />
      </View>
      <View style={{ marginVertical: 5 }}>
        <CategoryBar navigation={navigation} />
      </View>
      <View>
        <ProductList products={categoryProduct} navigation={navigation} />
      </View>
    </View>
  );
};

export default CategoryDetail;

const styles = StyleSheet.create({});
