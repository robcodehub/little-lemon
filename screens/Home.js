import { useEffect, useState, useCallback, useMemo } from "react";
import {
    Text,
    View,
    StyleSheet,
    SectionList,
    Alert,
    Image,
    Pressable,
} from "react-native";
import { Searchbar } from "react-native-paper";
import debounce from "lodash.debounce";
import {
    createTable,
    getMenuItems,
    saveMenuItems,
    filterByQueryAndCategories,
} from "../utils/database";
import Filters from "../components/Filters";
import { getSectionListData, useUpdateEffect } from "../utils/utils";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import * as Font from 'expo-font';
import * as SplashScreen from "expo-splash-screen";

const API_URL =
    'https://raw.githubusercontent.com/Meta-Mobile-Developer-PC/Working-With-Data-API/main/menu-items-by-category.json';
const sections = ['Appetizers', 'Salads', 'Beverages'];

const Item = ({ title, price }) => (
    <View style={styles.item}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.price}>${price}</Text>
    </View>
);


const Home = ({ navigation }) => {
    const [profile, setProfile] = useState({
        firstName: "",
        lastName: "",
        email: "",
        phoneNumber: "",
        orderStatuses: false,
        passwordChanges: false,
        specialOffers: false,
        newsletter: false,
        image: "",
    });
    const [data, setData] = useState([]);
    const [searchBarText, setSearchBarText] = useState("");
    const [query, setQuery] = useState("");
    const [filterSelections, setFilterSelections] = useState(
        sections.map(() => false)
    );

    const fetchData = async () => {
        // 1. Implement this function
        // Fetch the menu from the API_URL endpoint. You can visit the API_URL in your browser to inspect the data returned
        // The category field comes as an object with a property called "title". You just need to get the title value and set it under the key "category".
        // So the server response should be slighly transformed in this function (hint: map function) to flatten out each menu item in the array,

        try {
            const repsonse = await fetch(API_URL);
            const jsonResponse = await repsonse.json();
            const menuItems = jsonResponse.menu.map((item) => {
                return {
                    ...item,
                    category: item.category.title
                }
            });
            return menuItems;
        }
        catch (error) {
            console.error(error)
        }
        return [];
    }

    useEffect(() => {
        (async () => {
            try {
                await createTable();
                    // The application fetches data each time to prevent errors when testing and reviewing
                    // This can be optimized to only fetch the data once and then save it in the database
                    const menuItems = await fetchData();
                    saveMenuItems(menuItems);
  
                const sectionListData = getSectionListData(menuItems);
                setData(sectionListData);
            } catch (e) {
                // Handle error
                Alert.alert(e.message);
            }
        })();
    }, []);

    useUpdateEffect(() => {
        (async () => {
            const activeCategories = sections.filter((s, i) => {
                // If all filters are deselected, all categories are active
                if (filterSelections.every((item) => item === false)) {
                    return true;
                }
                return filterSelections[i];
            });
            try {
                const menuItems = await filterByQueryAndCategories(
                    query,
                    activeCategories
                );
                const sectionListData = getSectionListData(menuItems);
                setData(sectionListData);
            } catch (e) {
                Alert.alert(e.message);
            }
        })();
    }, [filterSelections, query]);

    const lookup = useCallback((q) => {
        setQuery(q);
    }, []);

    const debouncedLookup = useMemo(() => debounce(lookup, 500), [lookup]);

    const handleSearchChange = (text) => {
        setSearchBarText(text);
        debouncedLookup(text);
    };

    const handleFiltersChange = async (index) => {
        const arrayCopy = [...filterSelections];
        arrayCopy[index] = !filterSelections[index];
        setFilterSelections(arrayCopy);
    };

    // FONTS
    const [fontsLoaded, setFontsLoaded] = useState(false);

    const loadFonts = async () => {
        await Font.loadAsync({
            "Karla-Regular": require("../assets/fonts/Karla-Regular.ttf"),
            "Karla-Medium": require("../assets/fonts/Karla-Medium.ttf"),
            "Karla-Bold": require("../assets/fonts/Karla-Bold.ttf"),
            "Karla-ExtraBold": require("../assets/fonts/Karla-ExtraBold.ttf"),
            "MarkaziText-Regular": require("../assets/fonts/MarkaziText-Regular.ttf"),
            "MarkaziText-Medium": require("../assets/fonts/MarkaziText-Medium.ttf"),
        });
        setFontsLoaded(true);
    };

    useEffect(() => {
        loadFonts();
    }, []);

    const onLayoutRootView = useCallback(async () => {
        if (fontsLoaded) {
            await SplashScreen.hideAsync();
        }
    }, [fontsLoaded]);

    if (!fontsLoaded) {
        return null;
    }

    return (
        <View style={styles.container} onLayout={onLayoutRootView}>
            <View style={styles.header}>
                <Image
                    style={styles.logo}
                    source={require("../assets/img/littleLemonLogo.png")}
                    accessible={true}
                    accessibilityLabel={"Little Lemon Logo"}
                />
                <Pressable
                    style={styles.avatar}
                    onPress={() => navigation.navigate("Profile")}
                >
                    {profile.image ? (
                        <Image source={{ uri: profile.image }} style={styles.avatarImage} />
                    ) : (
                        <View style={styles.avatarEmpty}>
                            <Text style={styles.avatarEmptyText}>
                                {profile.firstName && Array.from(profile.firstName)[0]}
                                {profile.lastName && Array.from(profile.lastName)[0]}
                            </Text>
                        </View>
                    )}
                </Pressable>
            </View>
            <View style={styles.heroSection}>
                <Text style={styles.heroHeader}>Little Lemon</Text>
                <View style={styles.heroBody}>
                    <View style={styles.heroContent}>
                        <Text style={styles.heroHeader2}>Chicago</Text>
                        <Text style={styles.heroText}>
                            We are a family owned Mediterranean restaurant, focused on
                            traditional recipes served with a modern twist.
                        </Text>
                    </View>
                    <Image
                        style={styles.heroImage}
                        source={require("../assets/img/foodImage.png")}
                        accessible={true}
                        accessibilityLabel={"Little Lemon Food"}
                    />
                </View>
                <Searchbar
                    placeholder="Search"
                    placeholderTextColor="#333333"
                    onChangeText={handleSearchChange}
                    value={searchBarText}
                    style={styles.searchBar}
                    iconColor="#333333"
                    inputStyle={{ color: "#333333" }}
                    elevation={0}
                />
            </View>
            <Text style={styles.delivery}>ORDER FOR DELIVERY!</Text>
            <Filters
                selections={filterSelections}
                onChange={handleFiltersChange}
                sections={sections}
            />
            <SectionList
                style={styles.sectionList}
                sections={data}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <Item title={item.title} price={item.price} />
                )}
                renderSectionHeader={({ section: { title } }) => (
                    <Text style={styles.header}>{title}</Text>
                )}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
        paddingTop: Constants.statusBarHeight,
    },
    header: {
        padding: 12,
        flexDirection: "row",
        justifyContent: "center",
        backgroundColor: "#dee3e9",
    },
    logo: {
        height: 50,
        width: 150,
        resizeMode: "contain",
    },
    sectionList: {
        paddingHorizontal: 16,
    },
    searchBar: {
        marginTop: 15,
        backgroundColor: "#e4e4e4",
        shadowRadius: 0,
        shadowOpacity: 0,
    },
    item: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
    },
    itemBody: {
        flex: 1,
    },
    itemHeader: {
        fontSize: 24,
        paddingVertical: 8,
        color: "#495e57",
        backgroundColor: "#fff",
        fontFamily: "Karla-ExtraBold",
    },
    name: {
        fontSize: 20,
        color: "#EE9972",
        paddingBottom: 5,
        fontFamily: "Karla-Bold",
    },
    description: {
        fontSize: 20,
        color: "#495e57",
        paddingRight: 5,
        fontFamily: "Karla-Medium",
    },
    price: {
        fontSize: 20,
        color: "#EE9972",
        paddingTop: 5,
        fontFamily: "Karla-Medium",
    },
    title: {
        fontSize: 20,
        color: "#EE9972",
        paddingTop: 5,
        fontFamily: "Karla-Medium",
    },
    itemImage: {
        width: 100,
        height: 100,
    },
    avatar: {
        flex: 1,
        position: "absolute",
        right: 10,
        top: 10,
    },
    avatarImage: {
        width: 50,
        height: 50,
        borderRadius: 25,
    },
    avatarEmpty: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: "#0b9a6a",
        alignItems: "center",
        justifyContent: "center",
    },
    heroSection: {
        backgroundColor: "#495e57",
        padding: 15,
    },
    heroHeader: {
        color: "#f4ce14",
        fontSize: 54,
        fontFamily: "MarkaziText-Medium",
    },
    heroHeader2: {
        color: "#fff",
        fontSize: 30,
        fontFamily: "MarkaziText-Medium",
    },
    heroText: {
        color: "#fff",
        fontFamily: "Karla-Medium",
        fontSize: 14,
    },
    heroBody: {
        flexDirection: "row",
        justifyContent: "space-between",
    },
    heroContent: {
        flex: 1,
    },
    heroImage: {
        width: 100,
        height: 100,
        borderRadius: 12,
    },
    delivery: {
        fontSize: 18,
        padding: 15,
        fontFamily: "Karla-ExtraBold",
    },
});

export default Home;
