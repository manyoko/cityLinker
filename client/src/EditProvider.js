import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './editPage.css'
import axios from 'axios';
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
  Card
} from 'antd';
import { UploadOutlined, PlusOutlined, MinusCircleOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

const { TextArea } = Input;
const { Option } = Select;

const EditProviderForm = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [fileList, setFileList] = useState([]);

 
  

  useEffect(() => {
    fetchCategories();
    if (id) {
      fetchProvider();
    }
  }, [id]);

  const fetchCategories = async () => {
    try {
      const { data } = await axios.get('http://localhost:5000/api/categories');
      setCategories(data);
    } catch (error) {
      message.error('Failed to fetch categories');
    }
  };

  const fetchProvider = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`http://localhost:5000/api/providers/${id}`);
      console.log(data)
      form.setFieldsValue({
        ...data,
        category: data.category?._id || undefined,
        businessHours: Object.entries(data.businessHours).reduce((acc, [day, hours]) => {
          acc[day] = {
            open: hours.open ? dayjs(hours.open, 'HH:mm') : null,
            close: hours.close ? dayjs(hours.close, 'HH:mm') : null
          };
          return acc;
        }, {})
      });
      if (data.image) {
        setFileList(data.image.map((url, index) => ({
          uid: `-${index}`,
          name: `image-${index}.jpg`,
          status: 'done',
          url
        })));
      }
    } catch (error) {
      message.error('Failed to fetch provider');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      const formattedValues = {
        ...values,
        businessHours: Object.entries(values.businessHours || {}).reduce((acc, [day, hours]) => {
          acc[day] = {
            open: hours.open ? hours.open.format('HH:mm') : '',
            close: hours.close ? hours.close.format('HH:mm') : ''
          };
          return acc;
        }, {}),
        image: fileList.map(file => file.url || file.response?.url)
      };

      if (id) {
        await axios.put(`/api/providers/${id}`, formattedValues);
        message.success('Provider updated successfully');
      } 
      navigate('/admin/providers');
    } catch (error) {
      message.error(error.response?.data?.message || 'Failed to update provider');
    } finally {
      setLoading(false);
    }
  };

  const handleUploadChange = ({ fileList: newFileList }) => {
    setFileList(newFileList);
  };

  const uploadProps = {
    action: '/api/upload',
    listType: 'picture',
    fileList,
    onChange: handleUploadChange,
    multiple: true,
    accept: 'image/*'
  };

  const daysOfWeek = [
    'monday', 'tuesday', 'wednesday', 'thursday', 
    'friday', 'saturday', 'sunday'
  ];

  return (
    <Card title= "Edit Business Details" loading={loading}>
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          location: {
            city: 'Mbeya',
            state: 'Mbeya',
            coordinates: {
              lat: -8.9093,
              lng: 33.4608
            }
          },
          verified: false,
          featured: false
        }}
      >
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="name"
              label="Provider Name"
              rules={[{ required: true, message: 'Please enter provider name' }]}
            >
              <Input className="custom-input" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="category"
              label="Category"
              rules={[{ required: true, message: 'Please select category' }]}
            >
              <Select placeholder="Select category" className="custom-input">
                {categories.map(category => (
                  <Option key={category._id} value={category._id}>{category.name}</Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          name="description"
          label="Description"
          rules={[{ required: true, message: 'Please enter description' }]}
        >
          <TextArea rows={4} className="custom-input"/>
        </Form.Item>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name={['contact']}
              label="Contact Person"
              rules={[{ required: true, message: 'Please enter contact person' }]}
            >
              <Input className="custom-input" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name={['phone']}
              label="Phone Number"
              rules={[{ required: true, message: 'Please enter phone number' }]}
            >
              <Input className="custom-input"/>
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          name={['email']}
          label="Email"
          rules={[{ type: 'email', message: 'Please enter valid email' }]}
        >
          <Input className="custom-input" />
        </Form.Item>

        <Form.Item
          name={['website']}
          label="Website"
        >
          <Input className="custom-input"  addonBefore="https://" />
        </Form.Item>

        <Card title="Location" style={{ marginBottom: 16 }}>
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                name={['location', 'address']}
                label="Address"
                rules={[{ required: true, message: 'Please enter address' }]}
              >
                <Input className="custom-input"  />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name={['location', 'city']}
                label="City"
                rules={[{ required: true, message: 'Please enter city' }]}
              >
                <Input disabled />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name={['location', 'district']}
                label="State"
                rules={[{ required: true, message: 'Please enter district' }]}
              >
                <Input className="custom-input" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name={['location', 'zipCode']}
                label="Zip Code"
              >
                <Input className="custom-input" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name={['location', 'coordinates', 'lat']}
                label="Latitude"
              >
                <Input style={{ width: '100%' }} className="custom-input"/>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name={['location', 'coordinates', 'lng']}
                label="Longitude"
              >
                <Input style={{ width: '100%' }} className="custom-input" />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        <Card title="Business Hours" style={{ marginBottom: 16 }}>
          {daysOfWeek.map(day => (
            <Row gutter={16} key={day}>
              <Col span={4}>
                <Form.Item
                  label={day.charAt(0).toUpperCase() + day.slice(1)}
                  style={{ marginBottom: 8 }}
                >
                

                </Form.Item>
              </Col>
              <Col span={10}>
                <Form.Item
                  name={['businessHours', day, 'open']}
                  noStyle
                  
                >
                <ddiv>
                <TimePicker 
                  className="custom-timepicker"
                    format="HH:mm" 
                    placeholder="Open" 
                    style={{ width: '100%' }} 
                    disabled={false}
                    
                  />
                </ddiv>
                 
                </Form.Item>
              </Col>
              <Col span={10}>
                <Form.Item
                  name={['businessHours', day, 'close']}
                  noStyle
                >
                  <TimePicker 
                  className="custom-timepicker"
                    format="HH:mm" 
                    placeholder="Open" 
                    style={{ width: '100%' }} 
                    disabled={!form.getFieldValue(['businessHours', day, 'open'])}

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
                  <Space key={key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                    <Form.Item
                      {...restField}
                      name={[name, 'name']}
                      rules={[{ required: true, message: 'Missing service name' }]}
                    >
                      <Input placeholder="Service name" />
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      name={[name, 'price']}
                      rules={[{ required: true, message: 'Missing price' }]}
                    >
                      <Input placeholder="Price" />
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      name={[name, 'description']}
                    >
                      <Input placeholder="Description" />
                    </Form.Item>
                    <MinusCircleOutlined onClick={() => remove(name)} />
                  </Space>
                ))}
                <Form.Item>
                  <Button className='custom-input' type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                    Add Service
                  </Button>
                </Form.Item>
              </>
            )}
          </Form.List>
        </Card>

        <Form.Item label="Images" style={{ color: 'green' }}>
          <Upload {...uploadProps} >
            <Button style={{ backgroundColor: 'green', borderColor: 'green', color: 'white' }} icon={<UploadOutlined />}>Upload Images</Button>
          </Upload>
        </Form.Item>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="verified"
              label="Verified Provider"
              valuePropName="checked"
            >
              <Switch style={{ backgroundColor: 'green', borderColor: 'green' }} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="featured"
              label="Featured Provider"
              valuePropName="checked"
            >
              <Switch style={{ backgroundColor: 'green', borderColor: 'green' }}/>
            </Form.Item>
          </Col>
        </Row>

        <Form.Item>
          <Space>
            <Button type="primary" style={{ backgroundColor: 'green', borderColor: 'green' }} htmlType="submit" loading={loading}>
              Update
            </Button>
            <Button onClick={() => navigate('/admin/providers')}>
              Cancel
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default EditProviderForm;