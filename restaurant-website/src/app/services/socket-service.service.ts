import { Injectable } from '@angular/core';
import { Food } from '../models/interface';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SocketService {
  orderStatusEvent: Subject<boolean> = new Subject<boolean>();
  constructor() {}
  closingTime: string = '19:00:00';
  openingTime = '07:00:00';
  foodArray: Food[] = [
    {
      id: '33cc84aebc4b49b9bdc181782680c493',
      body: 'Beans with plantain and egg',
      image: '../../assets/beans and egg.jpg',
      alt: 'Beans with plantain and egg',
      price: '25.00',
      category: 'beans',
    },
    {
      id: '3646754e10574da3a16a90e2ecff5e06',
      body: 'Beans with plantain, egg and fish',
      image: '../../assets/closePackage.jpg',
      alt: 'Beans with plantain, egg and fish',
      price: '35.00',
      category: 'beans',
    },
    {
      id: '4226d4f1e91e404880345bc18be88e5b',
      body: 'Beans with plantain, egg and meat',
      image: '../../assets/closePackage.jpg',
      alt: 'Beans with plantain, egg and meat',
      price: '35.00',
      category: 'beans',
    },
    {
      id: 'ab62ad68aff443afa4c827a78a22e3a3',
      body: 'Beans with plantain, egg and chicken',
      image: '../../assets/BeansWithEggAndChicken.jpg',
      alt: 'Beans with plantain, egg and chicken',
      price: '35.00',
      category: 'beans',
    },
    {
      id: '6fe15e03186f478b8c2399ae70a51960',
      body: 'Beans and rice with plantain and egg',
      image: '../../assets/RiceWithPlantainAndEgg.jpg',
      alt: 'Beans and rice with plantain and egg',
      price: '35.00',
      category: 'beans',
    },
    {
      id: 'c4d3ddc886c540149323387915598847',
      body: 'Beans and rice with plantain, egg and chicken',
      image: '../../assets/BeansWithEggAndChicken.jpg',
      alt: 'Beans and rice with plantain, egg and chicken',
      price: '45.00',
      category: 'beans',
    },
    {
      id: 'ddbf19c31b9c4844865bf59fbb8fc985',
      body: 'Beans and rice with plantain, egg and meat',
      image: '../../assets/closePackage.jpg',
      alt: 'Beans and rice with plantain, egg and meat',
      price: '45.00',
      category: 'beans',
    },
    {
      id: '4d2da93389ce48aa8841c56891494942',
      body: 'Beans and rice with plantain, egg and fish',
      image: '../../assets/riceWithFishAndEgg.jpg',
      alt: 'Beans and rice with plantain, egg and fish',
      price: '45.00',
      category: 'beans',
    },
    {
      id: '91fcca31cba046fea468af2c659bcf86',
      body: 'Beans and rice with plantain, egg, fish and meat',
      image: '../../assets/closePackage.jpg',
      alt: 'Beans and rice with plantain, egg, fish and meat',
      price: '52.00',
      category: 'beans',
    },
    {
      id: '91fcca31cba046fea468af2c659bcf86',
      body: 'Beans and rice with plantain, egg, fish and chicken',
      image: '../../assets/closePackage.jpg',
      alt: 'Beans and rice with plantain, egg, fish and chicken',
      price: '52.00',
      category: 'beans',
    },
    {
      id: '91fcca31cba046fea468af2c659bcf93',
      body: 'Plain rice and stew with red fish',
      image:
        'https://d1bycbsuiqd0qu.cloudfront.net/200x200/images/9d7add1feb2c4db1b0f73dc7fff65a6c.jpeg',
      alt: 'Plain rice and stew with red fish',
      price: '37.00',
      category: 'rice',
    },
    {
      id: '91fcca31cba046fea468af2c659bcf94',
      body: 'Plain rice with stew and chicken',
      image:
        'https://d1bycbsuiqd0qu.cloudfront.net/200x200/images/739162e260634fecb0778d90df445c66.jpeg',
      alt: 'Plain rice with stew and chicken',
      price: '37.00',
      category: 'rice',
    },
    {
      id: '91fcca31cba046fea468af2c659bcf95',
      body: 'Plain rice and beef',
      image:
        'https://d1bycbsuiqd0qu.cloudfront.net/200x200/images/2160423773ec4c1a836543a6f3dab9b2.jpeg',
      alt: 'Plain rice and beef',
      price: '37.00',
      category: 'rice',
    },
    {
      id: '91fcca31cba046fea468af2c659bcf87',
      body: 'Fried Rice with chicken',
      image:
        'https://d1bycbsuiqd0qu.cloudfront.net/200x200/images/b18a3b04a8894f24aa8237b0c1ee425c.jpeg',
      alt: 'Fried Rice with chicken',
      price: '37.00',
      category: 'rice',
    },
    {
      id: '91fcca31cba046fea468af2c659bcf88',
      body: 'Fried Rice with cow meat',
      image:
        'https://d1bycbsuiqd0qu.cloudfront.net/200x200/images/16e9f7331bbe4e4f96600300b2e5a165.jpeg',
      alt: 'Fried Rice with cow meat',
      price: '37.00',
      category: 'rice',
    },
    {
      id: '91fcca31cba046fea468af2c659bcf89',
      body: 'Fried Rice with red fish',
      image:
        'https://d1bycbsuiqd0qu.cloudfront.net/200x200/images/58701df60c924014addee65c8a71f055.jpeg',
      alt: 'Fried Rice with red fish',
      price: '37.00',
      category: 'rice',
    },
    {
      id: '91fcca31cba046fea468af2c659bcf90',
      body: 'Jollof with chicken',
      image:
        'https://d1bycbsuiqd0qu.cloudfront.net/200x200/images/58701df60c924014addee65c8a71f055.jpeg',
      alt: 'Jollof with chicken',
      price: '37.00',
      category: 'rice',
    },
    {
      id: '91fcca31cba046fea468af2c659bcf91',
      body: 'Jollof with cow meat',
      image:
        'https://d1bycbsuiqd0qu.cloudfront.net/200x200/images/e5cda0f1e59b41caad09b73e0a25b19b.jpeg',
      alt: 'Jollof with cow meat',
      price: '37.00',
      category: 'rice',
    },
    {
      id: '91fcca31cba046fea468af2c659bcf92',
      body: 'Jollof with red fish',
      image:
        'https://d1bycbsuiqd0qu.cloudfront.net/200x200/images/c1770f9226fc4cc6a7e456155d6b5aad.jpeg',
      alt: 'Jollof with red fish',
      price: '37.00',
      category: 'rice',
    },
    {
      id: '91fcca31cba046fea468af2c659bcf96',
      body: 'Banku with okro stew (crab, Wele & Meat)',
      image: '../../assets/Banku-Fish-1.jpeg',
      alt: 'Banku with okro stew (crab, Wele & Meat)',
      price: '35.00',
      category: 'banku',
    },
    {
      id: '91fcca31cba046fea468af2c659bcf97',
      body: 'Banku with okro stew (crab, Wele,fish & Meat)',
      image: '../../assets/Banku-Fish-1.jpeg',
      alt: 'Banku with okro stew (crab, Wele,fish & Meat)',
      price: '40.00',
      category: 'banku',
    },
    {
      id: '91fcca31cba046fea468af2c659bcf101',
      body: 'Extra plantain',
      image:
        'https://d1bycbsuiqd0qu.cloudfront.net/200x200/images/4ba78244b5af46af8cb509f0194d8830.jpeg',
      alt: 'Extra plantain',
      price: '5.00',
      category: 'extras',
    },
    {
      id: '91fcca31cba046fea468af2c659bcf102',
      body: 'Extra chicken',
      image:
        'https://d1bycbsuiqd0qu.cloudfront.net/200x200/images/ae9b1e9d51b34dd5b7d89916dfc7615d.jpeg',
      alt: 'Extra chicken',
      price: '7.00',
      category: 'extras',
    },
    {
      id: '91fcca31cba046fea468af2c659bcf103',
      body: 'Extra beef',
      image:
        'https://d1bycbsuiqd0qu.cloudfront.net/200x200/images/281b3d9e91dc48c88eeea96fe7590f12.jpeg',
      alt: 'Extra beef',
      price: '7.00',
      category: 'extras',
    },
    {
      id: '91fcca31cba046fea468af2c659bcf98',
      body: 'Extra cow meat',
      image:
        'https://d1bycbsuiqd0qu.cloudfront.net/200x200/images/d286e5c8ba964d3c8d28ec7068fd1485.jpeg',
      alt: 'Extra cow meat',
      price: '7.00',
      category: 'extras',
    },
    {
      id: '91fcca31cba046fea468af2c659bcf99',
      body: 'Extra egg',
      image:
        'https://d1bycbsuiqd0qu.cloudfront.net/200x200/images/5d0d109937014f97a235e76d2f91f765.jpeg',
      alt: 'Extra egg',
      price: '2.00',
      category: 'extras',
    },
    {
      id: '91fcca31cba046fea468af2c659bcf100',
      body: 'Extra fish',
      image:
        'https://d1bycbsuiqd0qu.cloudfront.net/200x200/images/cca744abd84b442898562e5adf414cb9.jpeg',
      alt: 'Extra fish',
      price: '7.00',
      category: 'extras',
    },
    {
      id: '91fcca31cba046fea468af2c659bcf200',
      body: 'Fufu with goat meat and salmon',
      image: '../../assets/fufu.jpeg',
      alt: 'Fufu with goat meat and salmon',
      price: '40.00',
      category: 'fufu',
    },
    {
      id: '91fcca31cba046fea468af2c659bcf201',
      body: 'Fufu with cow meat and tuna',
      image: '../../assets/fufu.jpeg',
      alt: 'Fufu with cow meat and tuna',
      price: '40.00',
      category: 'fufu',
    },
    {
      id: '91fcca31cba046fea468af2c659bcf202',
      body: 'Fufu with Goat meat and cow meat',
      image: '../../assets/fufu.jpeg',
      alt: 'Fufu with Goat meat and cow meat',
      price: '40.00',
      category: 'fufu',
    },
    {
      id: '91fcca31cba046fea468af2c659bcf202',
      body: 'Salmon and tuna',
      image: '../../assets/fufulebene.jpg',
      alt: 'Salmon and tuna',
      price: '40.00',
      category: 'fufu',
    },
  ];

  getFoodByID(id: string): Food {
    return this.foodArray.filter((item) => item.id === id)[0];
  }

  getAllFoods(): Food[] {
    return this.foodArray;
  }

  getFoodByCategory(category: string): Food[] {
    if (category === 'all foods') {
      return this.foodArray.filter((food) => food.category !== 'extras');
    }
    return this.foodArray.filter((food) => food.category === category);
  }

  getClosingTime(): { closingTime: string; openingTime: string } {
    return { closingTime: this.closingTime, openingTime: this.openingTime };
  }
}
