"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PlusCircle, Edit, Trash2 } from "lucide-react";
import Image from "next/image";
import { toast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { Description } from "@radix-ui/react-dialog";
interface IProduct{
    _id?:string ;
    title:string;
    description:string;
    tag:string[];
    image:string[];
}
const Dashboard = () => {
    const [products, setProducts] = useState<IProduct[]  >([
        {
          _id: "temp",
          title: "Lorem, ipsum dolor",
          description: "Start adding your product, it will show up here",
          tag: ['car','speed'],
          image: ["/car1.svg"],
        },
        
      ]);
      const router = useRouter()
      const [token,setToken]=useState<string|null>()
    useEffect(()=>{
        const fetchProduct = async ()=>{
            setToken(localStorage.getItem('token'))
            
            try {
                const response = await fetch('http://localhost:3001/api/fetch',{
                    method:"POST",
                    headers:{
                        "CONTENT-TYPE":"application/json"
                    },
                    body:JSON.stringify({ token: localStorage.getItem('token')})
                    
                  })
                  const data2 = await response.json();
                  if(data2.statusCode===200){
                    setProducts(data2.data.product)
                
                    console.log(products);
                    
                    toast({
                        title: "Message",
                        description: "Product Fetched",
                      })
                    //   window.location.reload();
                  }else if(data2.message==='jwt expired'){
                    localStorage.removeItem('token')
                    
                  }
                  else{
                    throw new Error(JSON.stringify(data2))
                    toast({
                        title: "Message",
                        description: data2.message,
                        variant:"destructive"
                      })
                  }
            } catch (error:any) {
                console.log(error);
                
            }
        }
        const tokenLocalStorage = localStorage.getItem('token')
        if(tokenLocalStorage)
        fetchProduct();
        else
        router.replace('/')
    },[])



  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<IProduct >(
    {
        _id: "",
        title: "",
        description: "",
        tag: [],
        image: [],
      },
  );
  const [file, setFile] = useState([]);
  const [newProduct, setNewProduct] = useState<IProduct>({
    title: "",
    description: "",
    tag: [],
    image: [],
  });

  const handleImageChange = (event:any) => {
    setFile(event.target.files);
    console.log(event.target.files[0]);
    
    
  };

  const handleAddProduct = async () => {
    
    
    const formData =new FormData();
    formData.append('token',token as string)
    formData.append('title',newProduct.title)
    formData.append('description',newProduct.description)
    // formData.append('tag',newProduct.tag)
    Array.from(newProduct.tag).forEach((tag, index) => {
        formData.append(`tag`, tag);
      });
    formData.append('image',file as any)
    Array.from(file).forEach((file, index) => {
        formData.append(`image`, file);
      });
    
try {
    

    const response = await fetch('http://localhost:3001/api/upload',{
        method:"POST",
        // headers:{
        //     "CONTENT-TYPE":"application/json"
        // },
        body:formData
        
      })
      const data2 = await response.json();
      if(data2.statusCode===201){
        setProducts((prev) => [...(prev || []), data2.data]);

        // setProducts((prev) => {
        //     if (prev.length === 1 && prev[0]._id === "temp") {
        //       
        //       return [data2.data.product];
        //     }
        //     
        //     return [...prev, data2.data.product];
        //   });
          
        console.log(products);
        
        setNewProduct({ title: "", description: "", tag: [], image: [] });
    setIsAddDialogOpen(false);
        toast({
            title: "Message",
            description: "Product Addedd",
          })
      }else{
        toast({
            title: "Message",
            description: data2.message,
            variant:"destructive"
          })
      }
    } catch (error) {
        console.log(error);
        
    }
    
  };

  const handleEditProduct = async() => {
    
    try {
    

        const response = await fetch('http://localhost:3001/api/update',{
            method:"POST",
            headers:{
                "CONTENT-TYPE":"application/json"
            },
            body:JSON.stringify({
                data:{
                    productData:{
                        ...selectedProduct
                    }
                },
                token
            })
            
          })
          const data2 = await response.json();
          if(data2.statusCode===200){
            
            setProducts((prev) => {
                if (!prev) return []; 
                return prev.map((product) => 
                  product._id === selectedProduct?._id ? selectedProduct : product
                );
              });
              
              
            
        
            toast({
                title: "Message",
                description: "Edit Successfully",
              })
          }else{
            toast({
                title: "Message",
                description: data2.message,
                variant:"destructive"
              })
          }
        } catch (error) {
            console.log(error);
            
        }finally{
    setIsEditDialogOpen(false);
    setSelectedProduct({ _id:"",title: "", description: "", tag: [],image:[] });
        }
  };

  const handleDeleteProduct = async(id:string) => {
    

    try {
    

        const response = await fetch('http://localhost:3001/api/delete',{
            method:"POST",
            headers:{
                "CONTENT-TYPE":"application/json"
            },
            body:JSON.stringify({
                data:{
                    productData:{
                        _id:id
                    }
                },
                token
            })
            
          })
          const data2 = await response.json();
          if(data2.statusCode===200){
            
            setProducts((prev) => prev.filter((product) => product._id !== id));
              
              
            
        
            toast({
                title: "Message",
                description: data2.message,
              })
          }else{
            toast({
                title: "Message",
                description: data2.message,
                variant:"destructive"
              })
          }
        } catch (error) {
            console.log(error);
            
        }
  };

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">My Products</h1>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Product
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Product</DialogTitle>
                <DialogDescription>
                  Fill in the details of your new product
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={newProduct.title}
                    onChange={(e) =>
                      setNewProduct((prev) => ({ ...prev, title: e.target.value }))
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={newProduct.description}
                    onChange={(e) =>
                      setNewProduct((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="tag">Tag</Label>
                  <Input
                    id="tag"
                    value={newProduct.tag}
                    onChange={(e) =>
                      setNewProduct((prev) => (
                        { ...prev,
                        tag:e.target.value.split(',').map((tag) => tag.trim())
                    }
                        )
                    )
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="image">Image</Label>
                  <Input
                    id="image"
                    type="file"
                    accept="image/*"
                    name="image"
                    multiple
                    onChange={handleImageChange}
                  />
                 
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleAddProduct}>Add Product</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products?.map((product) => (
            <Card key={product._id}>
              <div className="relative h-48 w-full hover:cursor-pointer" onClick={()=>router.push(`/productView?productId=${product._id}`)} >
                <Image
                  src={product.image[0]}
                  alt={product.title}
                  fill
                  className="object-cover rounded-t-lg"
                />
              </div>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{product.title}</CardTitle>
                    <CardDescription>{product.tag?.map((tag,i)=>(<span key={i}>{tag}{" "}</span>))}</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setSelectedProduct(product);
                        setIsEditDialogOpen(true);
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteProduct(product._id?product._id:"")}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">{product.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Product</DialogTitle>
              <DialogDescription>
                Update the details of your product
              </DialogDescription>
            </DialogHeader>
            {selectedProduct && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="edit-title">Title</Label>
                  <Input
                    id="edit-title"
                    value={selectedProduct.title}
                    onChange={(e) =>
                      setSelectedProduct((prev) => ({
                        ...prev,
                        title: e.target.value,
                      }))
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="edit-description">Description</Label>
                  <Textarea
                    id="edit-description"
                    value={selectedProduct.description}
                    onChange={(e) =>
                      setSelectedProduct((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="edit-tag">Tag</Label>
                  <Input
                    id="edit-tag"
                    value={selectedProduct.tag}
                    onChange={(e) =>
                      setSelectedProduct((prev) => ({
                        ...prev,
                        tag: e.target.value.split(',').map((tag) => tag.trim()),
                      }))
                    }
                  />
                </div>
              </div>
            )}
            <DialogFooter>
              <Button onClick={handleEditProduct}>Save Changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Dashboard;