import { Inter } from "next/font/google";
import Layout from "@/components/Layout";
import { useRouter } from "next/router";
import { SyntheticEvent, useEffect, useState } from "react";
import axios from "axios";
import constants from "../../constants";

const inter = Inter({ subsets: ["latin"] });
declare var Stripe: any;

export default function Home() {
  const router = useRouter();
  const { code } = router.query;
  const [user, setUser] = useState({ first_name: '', last_name: '' });
  const [products, setProducts] = useState<{ id: number, title: string, description: string, price: number }[]>([]);
  const [quantities, setQuantities] = useState<{ [key: number]: number }>({});
  const [first_name, setFirstName] = useState<string>('');
  const [last_name, setLastName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [address, setAddress] = useState<string>('');
  const [country, setCountry] = useState<string>('');
  const [city, setCity] = useState<string>('');
  const [zip, setZip] = useState<string>('');


  useEffect(() => {
    if (code !== undefined) {
      (
        async () => {
          try {
            const { data } = await axios.get(`${constants.endpoints}links/${code}`);

            setUser(data.user)
            setProducts(data.product);
            if (data.quantity) {
              setQuantities(data.quantity.map((q: { id: number }) => ({
                id: q.id,
                quantity: 0
              })));
            }

          } catch (error) {
            console.log(error);
          }
        }
      )();
    }

  }, [code]);


  const changePrice = (id: number, quantity: number) => {
    setQuantities({ ...quantities, [id]: quantity });
  }

  const totalPrice = () => {
    return products.reduce((acc, product) => {
      return acc + (product.price * (quantities[product.id] || 0));
    }, 0);
  }

  const submit = async (e:SyntheticEvent) => {
    e.preventDefault();
      // quantitiesからproducts配列を生成
  const productsArray = Object.entries(quantities).map(([productId, quantity]) => ({
    product_id: parseInt(productId, 10),
    quantity
  }));
    try {
      const { data } = await axios.post(`${constants.endpoints}orders`, {
        first_name,
        last_name,
        email,
        address,
        country,
        city,
        zip,
        code,
        products: productsArray // 修正されたproducts配列を使用
      });
      const stripe = Stripe(constants.stripe_key);

      stripe.redirectToCheckout({
        sessionId: data.id
      });

    } catch (error) {
      router.push('/error');
    }
  }

  return (
    <Layout>
      <main>
        <div className="py-5 text-center">
          <h2>Welcome</h2>
          <p className="lead">{user?.first_name} {user?.last_name} has invited you to buy these products</p>
        </div>

        <div className="row g-5">
          <div className="col-md-5 col-lg-4 order-md-last">
            <h4 className="d-flex justify-content-between align-items-center mb-3">
              <span className="text-primary">Your cart</span>
              <span className="badge bg-primary rounded-pill">3</span>
            </h4>
            <ul className="list-group mb-3">
              {products && products.map(product => {
                return (
                  <div key={product.id}>
                    <li className="list-group-item d-flex justify-content-between lh-sm">
                      <div>
                        <h6 className="my-0">{product.title}</h6>
                        <small className="text-muted">{product.description}</small>
                      </div>
                      <span className="text-muted">${product.price}</span>
                    </li>
                    <li className="list-group-item d-flex justify-content-between lh-sm">
                      <div>
                        <p className="my-0">Quantity</p>
                      </div>
                      <input
                        type="number"
                        min="0"
                        className="text-muted form-control"
                        defaultValue={0}
                        style={{ width: 65 }}
                        onChange={e => changePrice(product.id, parseInt(e.target.value))}
                      />
                    </li>
                  </div>
                )
              })}

              <li className="list-group-item d-flex justify-content-between">
                <span>Total (USD)</span>
                <strong>${totalPrice()}</strong>
              </li>
            </ul>
          </div>

          <div className="col-md-7 col-lg-8">
            <h4 className="mb-3">Personal Info</h4>
            <form className="needs-validation" onSubmit={submit}>
              <div className="row g-3">
                <div className="col-sm-6">
                  <label className="form-label">First name</label>
                  <input
                    type="text"
                    className="form-control"
                    id="firstName"
                    placeholder=""
                    required
                    onChange={e => setFirstName(e.target.value)} />
                </div>

                <div className="col-sm-6">
                  <label className="form-label">Last name</label>
                  <input type="text" className="form-control" id="lastName" placeholder="" required
                    onChange={e => setLastName(e.target.value)} />

                </div>

                <div className="col-12">
                  <label className="form-label">Email <span className="text-muted">(Optional)</span></label>
                  <input type="email" className="form-control" id="email" placeholder="you@example.com" required
                    onChange={e => setEmail(e.target.value)} />
                </div>

                <div className="col-12">
                  <label className="form-label">Address</label>
                  <input type="text" className="form-control" id="address" placeholder="1234 Main St" required
                    onChange={e => setAddress(e.target.value)} />

                </div>


                <div className="col-md-5">
                  <label className="form-label">Country</label>
                  <input type="text" className="form-control" id="country" placeholder="Country"
                    onChange={e => setCountry(e.target.value)} />
                </div>

                <div className="col-md-4">
                  <label className="form-label">City</label>
                  <input type="text" className="form-control" id="country" placeholder="City"
                    onChange={e => setCity(e.target.value)} />
                </div>

                <div className="col-md-3">
                  <label className="form-label">Zip</label >
                  <input type="text" className="form-control" id="zip" placeholder=""
                    onChange={e => setZip(e.target.value)} />
                </div>
              </div>
              <hr className="my-4" />
              <button className="w-100 btn btn-primary btn-lg" type="submit">Continue to checkout</button>
            </form>
          </div>
        </div>
      </main>
    </Layout>


  );
}