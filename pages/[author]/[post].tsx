import { useEffect, useLayoutEffect, useState } from "react";
import { useRouter } from "next/router";
import Avatar from "@mui/material/Avatar";
import Image from "next/image";
import { client } from "@/Contentful/fetch_blogs";
import Head from "next/head";

import { Blog } from "@/Types/types";
import { Paths } from "@/Types/types";
import { devArticles } from "@/lib/utilities/devArticles";
import { documentToReactComponents } from "@contentful/rich-text-react-renderer";
import BlogArticles2 from "@/components/Home/blogs/BlogArticles2";
import { date } from "@/lib/utilities/date";

export async function getStaticPaths() {
  const blogs = await client.getEntries({ content_type: "blog" });
  const blogs2 = await client.getEntries({ content_type: "blog2" });
  const data: Blog[] = blogs.items;
  const data2: Blog[] = blogs2.items;
  const paths = devArticles(data, data2).map((article: Blog): Paths => {
    return {
      params: {
        author: article.fields.authorName,
        post: article.fields.blogTitle,
      },
    };
  });
  return {
    paths,
    fallback: false,
  };
}

export async function getStaticProps(props: Paths) {
  const blogs = await client.getEntries({ content_type: "blog" });
  const blogs2 = await client.getEntries({ content_type: "blog2" });
  return {
    props: { data: props.params, blogs: blogs.items, blogs2: blogs2.items },
  };
}
function Post(props: {
  data: { author: string; post: string };
  blogs: Blog[];
  blogs2: Blog[];
}) {
  const route = useRouter();
  const [blog, setBlog] = useState([]);

  useEffect(() => {
    const blog1: Blog[] = props.blogs.filter((article): boolean => {
      return (
        article.fields.authorName === props.data.author &&
        article.fields.blogTitle === props.data.post
      );
    });
    const blog2: Blog[] = props.blogs2.filter((article): boolean => {
      return (
        article.fields.authorName === props.data.author &&
        article.fields.blogTitle === props.data.post
      );
    });
    if (blog2[0] !== undefined) {
      blog1.push(blog2[0]);
    }
    setBlog(blog1);
  }, [route.asPath]);

  let [lockScroll, setLockScroll] = useState("auto");
  const useBodyScrollLock = () => {
    useLayoutEffect((): any => {
      const originalStyle = window.getComputedStyle(document.body).overflow;
      document.body.style.overflow = lockScroll;
      return () => (document.body.style.overflow = originalStyle);
    }, [route.asPath]);
  };
  useEffect(() => {
    setLockScroll("auto");
  }, []);
  useBodyScrollLock();

  return (
    <>
      <Head>
        <title>{props.data.post}</title>
      </Head>
      <section className="flex justify-around items-start max-md:flex-col-reverse ">
        <div>
          {blog.map((article) => {
            return (
              <div
                key={article.sys.id}
                className="bg-white max-md:w-[100vw] w-[60vw] mt-2 rounded-md border border-gray-200 border-solid mb-3 max-md:ml-0 ml-1"
              >
                <Image
                  src={"https://" + article.fields.Image.fields.file.url}
                  alt={article.fields.Image.fields.file.fileName}
                  width={1000}
                  height={0}
                  className="w-full h-96 object-cover rounded-t"
                />
                <div className="flex items-center justify-between">
                  <div className="flex ml-14 mt-7 items-center">
                    <Avatar
                      alt={article.fields.authorImage.fields.file.fileName}
                      src={article.fields.authorImage.fields.file.url}
                      style={{ zIndex: "0" }}
                    />
                    <p className=" ml-2">{article.fields.authorName}</p>
                  </div>
                  <p className="text-xs pl-2 text-gray-600 mr-[30px] mt-9">{`${
                    date(article.fields.dateTime)[0]
                  } ${date(article.fields.dateTime)[1]} ${
                    date(article.fields.dateTime)[2]
                  }
                  `}</p>
                </div>
                <p className="max-[900px]:text-[38px] max-md:text-[40px] max-md:mx-[30px] max-md:w-[87%] text-[39px] font-extrabold w-[85%] ml-14 mt-10">
                  {article.fields.blogTitle}
                </p>
                <p className="max-md:w-[85%] max-md:mx-[30px] ml-14 mt-8 font-sans font-light w-4/5 leading-[35px] text-xl mb-3">
                  {documentToReactComponents(article.fields.content)}
                </p>
              </div>
            );
          })}
        </div>
        <BlogArticles2 secondArticles={props.blogs2} width="w-96" />
      </section>
    </>
  );
}

export default Post;
