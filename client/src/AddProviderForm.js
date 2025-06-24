import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { handleAuthError } from "./utils/errorHandler";
import axios from "axios";
import {
  Form,
  Input,
  Button,
  Select,
  message,
  Space,
  Row,
  Col,
  Upload,
  TimePicker,
  Switch,
  Card,
} from "antd";
import {
  UploadOutlined,
  PlusOutlined,
  MinusCircleOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";

const { TextArea } = Input;
const { Option } = Select;

const ProviderForm = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [fileList, setFileList] = useState([]);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const { data } = await axios.get("http://localhost:5000/api/categories");
      setCategories(data);
    } catch (error) {
      message.error("Failed to fetch categories");
    }
  };

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      // First upload images if there are any
      let imageUrls = [];

      if (fileList.length > 0) {
        const formData = new FormData();
        fileList.forEach((file) => {
          if (file.originFileObj) {
            formData.append("images", file.originFileObj);
          }
        });

        // Upload images to the multiple endpoint
        const uploadResponse = await axios.post(
          "http://localhost:5000/api/providers/multiple",
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );

        // Extract image URLs from response
        imageUrls = uploadResponse.data.images || [];
      }

      // Prepare provider data
      const formattedValues = {
        ...values,
        businessHours: Object.entries(values.businessHours || {}).reduce(
          (acc, [day, hours]) => {
            acc[day] = {
              open: hours.open ? hours.open.format("HH:mm") : "",
              close: hours.close ? hours.close.format("HH:mm") : "",
            };
            return acc;
          },
          {}
        ),
        images: imageUrls, // Use 'images' to match your backend
      };

      // Create the provider (you'll need a separate endpoint for this)
      console.log("Submitting values:", formattedValues);

      const response = await axios.post(
        "http://localhost:5000/api/providers",
        formattedValues
      );

      message.success("Provider created successfully!");
      navigate("/admin/providers");
    } catch (error) {
      const authError = handleAuthError(error);
      if (authError) {
        setNotification(authError);
      }
      message.error(
        error.response?.data?.message || "Failed to create provider"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleUploadChange = ({ fileList: newFileList }) => {
    setFileList(newFileList);
  };

  // Remove the action prop to prevent automatic uploads
  const uploadProps = {
    listType: "picture",
    fileList,
    onChange: handleUploadChange,
    multiple: true,
    accept: "image/*",
    beforeUpload: () => false, // Prevent automatic upload
  };

  const daysOfWeek = [
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
    "sunday",
  ];

  return (
    <Card title="Add New Provider">
      {notification && (
        <div className={`notification ${notification.severity}`}>
          <h3>{notification.title}</h3>
          <p>{notification.message}</p>
          <button onClick={() => setNotification(null)}>Dismiss</button>
        </div>
      )}
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          location: {
            city: "Mbeya",
            district: "Mbeya",
            coordinates: {
              lat: -8.9093,
              lng: 33.4608,
            },
          },
          verified: false,
          featured: false,
        }}
      >
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="name"
              label="Business Name"
              rules={[
                { required: true, message: "Please enter business name" },
              ]}
            >
              <Input />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="category"
              label="Category"
              rules={[{ required: true, message: "Please select category" }]}
            >
              <Select placeholder="Select category">
                {categories.map((category) => (
                  <Option key={category._id} value={category._id}>
                    {category.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          name="description"
          label="Description"
          rules={[{ required: true, message: "Please enter description" }]}
        >
          <TextArea rows={4} />
        </Form.Item>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name={["contact"]}
              label="Contact Person"
              rules={[
                { required: true, message: "Please enter contact person" },
              ]}
            >
              <Input />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name={["phone"]}
              label="Phone Number"
              rules={[{ required: true, message: "Please enter phone number" }]}
            >
              <Input />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          name={["email"]}
          label="Email"
          rules={[{ type: "email", message: "Please enter valid email" }]}
        >
          <Input />
        </Form.Item>

        <Form.Item name={["website"]} label="Website">
          <Input addonBefore="https://" />
        </Form.Item>

        <Card title="Location" style={{ marginBottom: 16 }}>
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                name={["location", "address"]}
                label="Address"
                rules={[{ required: true, message: "Please enter address" }]}
              >
                <Input />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name={["location", "city"]}
                label="City"
                rules={[{ required: true, message: "Please enter city" }]}
              >
                <Input disabled />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name={["location", "district"]}
                label="District"
                rules={[
                  { required: true, message: "Please enter district name" },
                ]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name={["location", "zipCode"]} label="Zip Code">
                <Input />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name={["location", "coordinates", "lat"]}
                label="Latitude"
              >
                <Input style={{ width: "100%" }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name={["location", "coordinates", "lng"]}
                label="Longitude"
              >
                <Input style={{ width: "100%" }} />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        <Card title="Business Hours" style={{ marginBottom: 16 }}>
          {daysOfWeek.map((day) => (
            <Row gutter={16} key={day}>
              <Col span={4}>
                <Form.Item
                  label={day.charAt(0).toUpperCase() + day.slice(1)}
                  style={{ marginBottom: 8 }}
                ></Form.Item>
              </Col>
              <Col span={10}>
                <Form.Item name={["businessHours", day, "open"]} noStyle>
                  <TimePicker
                    format="HH:mm"
                    placeholder="Opening time"
                    style={{ width: "100%" }}
                    disabled={false}
                  />
                </Form.Item>
              </Col>
              <Col span={10}>
                <Form.Item name={["businessHours", day, "close"]} noStyle>
                  <TimePicker
                    format="HH:mm"
                    placeholder="Closing time"
                    style={{ width: "100%" }}
                    disabled={false}
                  />
                </Form.Item>
              </Col>
            </Row>
          ))}
        </Card>

        <Card title="Services" style={{ marginBottom: 16 }}>
          <Form.List name="services">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }) => (
                  <Space
                    key={key}
                    style={{ display: "flex", marginBottom: 8 }}
                    align="baseline"
                  >
                    <Form.Item
                      {...restField}
                      name={[name, "name"]}
                      rules={[
                        { required: true, message: "Missing service name" },
                      ]}
                    >
                      <Input placeholder="Service name" />
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      name={[name, "price"]}
                      rules={[{ required: true, message: "Missing price" }]}
                    >
                      <Input placeholder="Price" />
                    </Form.Item>
                    <Form.Item {...restField} name={[name, "description"]}>
                      <Input placeholder="Description" />
                    </Form.Item>
                    <MinusCircleOutlined onClick={() => remove(name)} />
                  </Space>
                ))}
                <Form.Item>
                  <Button
                    type="dashed"
                    onClick={() => add()}
                    block
                    icon={<PlusOutlined />}
                  >
                    Add Service
                  </Button>
                </Form.Item>
              </>
            )}
          </Form.List>
        </Card>

        <Form.Item label="Images">
          <Upload {...uploadProps}>
            <Button icon={<UploadOutlined />}>Upload Images</Button>
          </Upload>
        </Form.Item>

        <Form.Item>
          <Space>
            <Button type="primary" htmlType="submit" loading={loading}>
              Create
            </Button>
            <Button onClick={() => navigate("/admin")}>Cancel</Button>
          </Space>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default ProviderForm;
